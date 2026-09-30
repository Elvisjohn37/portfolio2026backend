// One-off read-only helper: prints the shape of the existing portfolio
// documents so the admin forms can be built against real fields.
import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDb from "../config/db.js"

dotenv.config()

const run = async () => {
	await connectDb()

	const names = await mongoose.connection.db.listCollections().toArray()
	console.log("COLLECTIONS:", names.map(c => c.name).join(", "))

	const about = await mongoose.connection.db.collection("about").findOne({})
	console.log("ABOUT:", JSON.stringify(about, null, 2))

	const stacks = await mongoose.connection.db.collection("techstacks").find({}).toArray()
	console.log("TECH STACKS:", JSON.stringify(stacks, null, 2))

	const aboutStacks = await mongoose.connection.db
		.collection("abouttechstacks")
		.find({})
		.limit(20)
		.toArray()
	console.log("ABOUT TECH STACKS:", JSON.stringify(aboutStacks, null, 2))

	await mongoose.disconnect()
}

run().catch(err => {
	console.error("INSPECT FAILED:", err.message)
	process.exit(1)
})
