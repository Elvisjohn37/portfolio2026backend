import mongoose from "mongoose"
import dns from "node:dns"

const connectDb = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			serverSelectionTimeoutMS: 10000,
		})
	} catch (err) {
		if (err?.code !== "ECONNREFUSED") throw err

		// Some Windows/network DNS configurations refuse Node's SRV queries even
		// though the same Atlas record resolves through nslookup. Retry using
		// public resolvers while leaving the MongoDB URI and credentials unchanged.
		await mongoose.disconnect().catch(() => {})
		dns.setServers(["8.8.8.8", "1.1.1.1"])
		await mongoose.connect(process.env.MONGO_URI, {
			serverSelectionTimeoutMS: 10000,
		})
	}

	console.log("Connected to MongoDB")
}

export default connectDb
