// Restore the formerly hardcoded Tools entries without changing existing blocks.
import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDb from "../config/db.js"
import About from "../models/about.js"
import TechStack from "../models/tech-stack.js"
import Block from "../models/about-tech-stack.js"

dotenv.config({ quiet: true })

try {
    await connectDb()
    const about = process.env.ABOUT_ID
        ? await About.findById(process.env.ABOUT_ID).select("_id")
        : await About.findOne().select("_id")
    if (!about) throw new Error("About profile not found")

    const group = await TechStack.findOneAndUpdate(
        { techStack: "Tools" },
        { $setOnInsert: { techStack: "Tools" } },
        { upsert: true, new: true },
    )

    for (const name of ["Docker", "Github", "Bitbucket", "Jira", "Trello", "Jenkins"]) {
        const result = await Block.updateOne(
            { about: about._id, techStack: group._id, name: new RegExp(`^${name}$`, "i") },
            { $setOnInsert: {
                name,
                description: "7 years of experience",
                about: about._id,
                techStack: group._id,
            } },
            { upsert: true, runValidators: true, timestamps: false },
        )
        console.log(`${name}: ${result.upsertedCount ? "created" : "already present"}`)
    }
    const blocks = await Block.find({ about: about._id, techStack: group._id }).select("name").lean()
    console.log("Tools in database:", blocks.map(block => block.name).join(", "))
} catch (error) {
    console.error("Tools migration failed:", error.name)
    process.exitCode = 1
} finally {
    await mongoose.disconnect()
}
