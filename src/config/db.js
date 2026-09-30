import mongoose from "mongoose"
import dns from "node:dns"

const CONNECT_OPTIONS = { serverSelectionTimeoutMS: 10000 }

// Resolvers used when the OS/local DNS agent cannot answer SRV queries.
// Override with DNS_SERVERS="1.1.1.1,9.9.9.9" in .env when needed.
// Read lazily because dotenv.config() runs after this module is imported.
const getPublicDnsServers = () =>
	(process.env.DNS_SERVERS ?? "8.8.8.8,1.1.1.1")
		.split(",")
		.map(server => server.trim())
		.filter(Boolean)

const DOH_ENDPOINT = "https://dns.google/resolve"

const DNS_ERROR_CODES = new Set([
	"ETIMEOUT",
	"ESERVFAIL",
	"ENOTFOUND",
	"EREFUSED",
	"ECONNREFUSED",
	"EHOSTUNREACH",
	"EAI_AGAIN",
])

// mongodb+srv:// URIs force the driver to run DNS SRV/TXT lookups before it can
// even open a socket. Broken/absent answers (a local DNS agent such as a VPN
// proxy answering on 127.0.0.1, for example) surface as ETIMEOUT/ESERVFAIL.
const isDnsFailure = err => {
	if (!err) return false
	if (DNS_ERROR_CODES.has(err.code)) return true
	return /querySrv|queryTxt|_mongodb\._tcp/i.test(err.message ?? "")
}

const resolveOverHttps = async (name, type) => {
	const res = await fetch(
		`${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${type}`,
		{
			headers: { accept: "application/dns-json" },
			signal: AbortSignal.timeout(10000),
		}
	)

	if (!res.ok) {
		throw new Error(`DNS over HTTPS ${type} lookup for ${name} failed (HTTP ${res.status})`)
	}

	const { Answer = [] } = await res.json()
	if (!Answer.length) {
		throw new Error(`DNS over HTTPS ${type} lookup for ${name} returned no records`)
	}

	return Answer.map(answer => answer.data)
}

// "0 0 27017 ac-73absnz-shard-00-00.wz3lrtm.mongodb.net." -> "host:port"
const srvAnswersToHosts = answers =>
	answers.map(data => {
		const [, , port, host] = String(data).trim().split(/\s+/)
		if (!host || !port) throw new Error(`Unexpected SRV record: ${data}`)
		return `${host.replace(/\.$/, "")}:${port}`
	})

// Atlas publishes options such as authSource/replicaSet as a TXT record.
const txtAnswersToParams = answers =>
	new URLSearchParams(
		answers.map(data => String(data).replace(/^"|"$/g, "")).join("")
	)

const SRV_URI_PATTERN =
	/^mongodb\+srv:\/\/(?:([^@/?#]+)@)?([^/?#]+)(?:\/([^?#]*))?(?:\?(.*))?$/

/**
 * Rebuilds a mongodb+srv:// URI as an equivalent mongodb:// seed list by
 * resolving the SRV and TXT records over HTTPS, so the connection still works
 * on networks that filter DNS on port 53.
 */
const buildDirectUri = async uri => {
	const match = SRV_URI_PATTERN.exec(uri)
	if (!match) throw new Error("Could not parse the mongodb+srv connection string")

	const [, credentials, host, database = "", query = ""] = match

	const [srvAnswers, txtAnswers] = await Promise.all([
		resolveOverHttps(`_mongodb._tcp.${host}`, "SRV"),
		resolveOverHttps(host, "TXT").catch(() => []),
	])

	const params = new URLSearchParams(query)
	for (const [key, value] of txtAnswersToParams(txtAnswers)) params.set(key, value)
	params.set("tls", "true")
	if (credentials && !params.has("authSource")) params.set("authSource", "admin")

	const userInfo = credentials ? `${credentials}@` : ""
	const seedList = srvAnswersToHosts(srvAnswers).join(",")

	return `mongodb://${userInfo}${seedList}/${database}?${params.toString()}`
}

const connectDb = async () => {
	const uri = process.env.MONGO_URI || process.env.MONGODB_URI
	if (!uri) {
		throw new Error("MONGO_URI (or MONGODB_URI) is not set - check the .env file")
	}

	try {
		await mongoose.connect(uri, CONNECT_OPTIONS)
		console.log("Connected to MongoDB")
		return
	} catch (err) {
		if (!isDnsFailure(err)) throw err

		console.warn(
			`MongoDB DNS lookup failed (${err.code ?? err.message}); retrying with ${getPublicDnsServers().join(", ")}`
		)
	}

	// SRV/TXT lookups go through c-ares, which honours dns.setServers, while
	// hostname lookups keep using the OS resolver. Credentials stay untouched.
	const publicDnsServers = getPublicDnsServers()

	await mongoose.disconnect().catch(() => {})
	dns.setServers(publicDnsServers)

	try {
		await mongoose.connect(uri, CONNECT_OPTIONS)
	} catch (err) {
		if (!isDnsFailure(err) || !uri.startsWith("mongodb+srv://")) throw err

		await mongoose.disconnect().catch(() => {})
		console.warn(
			`MongoDB DNS retry failed (${err.code ?? err.message}); resolving the cluster records over HTTPS instead`
		)

		const directUri = await buildDirectUri(uri)
		await mongoose.connect(directUri, CONNECT_OPTIONS)
	}

	console.log("Connected to MongoDB")
}

export default connectDb
