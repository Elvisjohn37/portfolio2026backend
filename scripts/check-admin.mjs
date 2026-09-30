// One-off diagnostic: lists admin accounts (no hashes) so we can see whether
// the seeded account exists and is active. Run: node scripts/check-admin.mjs
import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDb from "../src/config/db.js"
import AdminUser from "../src/models/admin-user.js"

dotenv.config()

const run = async () => {
	await connectDb()

	console.log("DB NAME:", mongoose.connection.name)
	console.log("COLLECTION:", AdminUser.collection.name)

	const users = await AdminUser.find({}).select("+password")
	console.log("ADMIN COUNT:", users.length)

	for (const user of users) {
		console.log(
			JSON.stringify({
				email: user.email,
				name: user.name,
				role: user.role,
				isActive: user.isActive,
				hasPassword: Boolean(user.password),
				passwordLooksHashed: typeof user.password === "string" && user.password.startsWith("$2"),
				createdAt: user.createdAt,
				lastLoginAt: user.lastLoginAt,
			}),
		)
	}

	await mongoose.disconnect()
}

run().catch(err => {
	console.error("CHECK FAILED:", err.message)
	process.exit(1)
})
