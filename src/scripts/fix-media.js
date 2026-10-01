// One-off repair: rewrites absolute media URLs in project documents back to the
// API-relative path they should have been stored as.
//
// Older admin builds baked the origin of whichever API the upload went through
// into the document (`http://localhost:8080/api/media/<id>`). Those URLs are
// unreachable for visitors of the deployed portfolio, so this normalises them
// to `/api/media/<id>`. Safe to re-run: already-relative values are skipped.
//
//   npm run fix:media
import dotenv from "dotenv"
import mongoose from "mongoose"
import Project from "../models/project.js"
import connectDb from "../config/db.js"

dotenv.config()

const MEDIA_PATH = /^\/api\/media\/[a-f0-9]{24}$/i

/** Returns the relative path when the value targets the API media endpoint. */
const toMediaPath = value => {
	if (typeof value !== "string" || !value.trim()) return null
	try {
		// Absolute values resolve against a throwaway base; the parsed pathname
		// drops the origin we deliberately discard.
		const { pathname } = new URL(value, "http://placeholder.invalid")
		return MEDIA_PATH.test(pathname) ? pathname : null
	} catch {
		return null
	}
}

const run = async () => {
	await connectDb()

	const projects = await Project.find({
		$or: [{ logoSrc: /^\/api\/media\// }, { thumbnail: /^\/api\/media\// }],
	}).lean()

	let updated = 0

	for (const project of projects) {
		const logoSrc = toMediaPath(project.logoSrc) ?? project.logoSrc
		const thumbnail = toMediaPath(project.thumbnail) ?? project.thumbnail
		const images = (project.images ?? []).map(
			image => toMediaPath(image) ?? image,
		)

		if (
			logoSrc === project.logoSrc &&
			thumbnail === project.thumbnail &&
			images.every((image, index) => image === (project.images ?? [])[index])
		) {
			continue
		}

		await Project.updateOne({ _id: project._id }, { logoSrc, thumbnail, images })
		updated += 1
		console.log(`FIXED ${project.slug}: ${logoSrc} | ${thumbnail}`)
	}

	console.log(`\n${updated} project(s) updated.`)
	await mongoose.disconnect()
}

run().catch(err => {
	console.error("FIX MEDIA FAILED:", err.message)
	process.exit(1)
})
