/**
 * Idempotent seeder: `npm run seed`
 *
 * 1. Creates (or refreshes) the first admin account from .env.
 * 2. Ensures the About tech-stack groups exist (Frontend / Backend / Tools).
 * 3. Imports the projects that used to be hardcoded in the frontend.
 * 4. Imports the work-experience timeline.
 *
 * Existing records are never overwritten, so running it again is safe.
 */
import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDb from "../config/db.js"
import AdminUser from "../models/admin-user.js"
import TechStack from "../models/tech-stack.js"
import Project, { slugify } from "../models/project.js"
import WorkExperience from "../models/work-experience.js"
import uniqueSlug from "../utils/unique-slug.js"
import { TECH_STACK_GROUPS, SEED_PROJECTS, SEED_EXPERIENCE } from "./data/seed-data.js"

dotenv.config()

const line = message => console.log(`[seed] ${message}`)

const seedAdminUser = async () => {
	const name = process.env.ADMIN_NAME || "Portfolio Admin"
	const email = (process.env.ADMIN_EMAIL || "admin@portfolio.local").toLowerCase()
	const password = process.env.ADMIN_PASSWORD || "Admin12345"
	const resetPassword = process.env.RESET_ADMIN_PASSWORD === "true"

	const existing = await AdminUser.findOne({ email }).select("+password")

	if (existing) {
		existing.name = name
		existing.role = "admin"
		existing.isActive = true
		// The hash is only replaced when explicitly requested, so re-running
		// the seeder never silently resets a password someone changed.
		if (resetPassword) existing.password = password
		await existing.save()

		line(`Admin account already present: ${email}${resetPassword ? " (password reset)" : ""}`)
		return
	}

	await AdminUser.create({ name, email, password })
	line(`Created admin account -> ${email} / ${password}`)
}

const seedTechStackGroups = async () => {
	for (const group of TECH_STACK_GROUPS) {
		const exists = await TechStack.findOne({ techStack: group.techStack })

		if (exists) {
			line(`Tech stack group already present: ${group.techStack}`)
			continue
		}

		await TechStack.create(group)
		line(`Created tech stack group: ${group.techStack}`)
	}
}

const seedProjects = async () => {
	const created = new Map()

	for (const [index, project] of SEED_PROJECTS.entries()) {
		const existing = await Project.findOne({ slug: slugify(project.name) })

		if (existing) {
			created.set(existing.name, existing._id)
			line(`Project already present: ${project.name}`)
			continue
		}

		const document = await Project.create({
			...project,
			order: index,
			slug: await uniqueSlug(Project, project.name),
		})

		created.set(document.name, document._id)
		line(`Created project: ${project.name}`)
	}

	// Existing documents are also indexed so the experience links resolve
	// even when the projects were seeded in an earlier run.
	const all = await Project.find().select("name")

	return new Map([...all.map(item => [item.name, item._id]), ...created])
}

const seedExperience = async () => {
	const projectIds = await seedProjects()
	const existing = await WorkExperience.estimatedDocumentCount()

	if (existing) {
		line(`Work experience already present (${existing} entries) - skipping`)
		return
	}

	for (const [index, experience] of SEED_EXPERIENCE.entries()) {
		const { projectNames = [], ...rest } = experience

		await WorkExperience.create({
			...rest,
			order: index,
			projects: projectNames
				.map(name => projectIds.get(name))
				.filter(Boolean),
		})

		line(`Created work experience: ${experience.title} @ ${experience.company}`)
	}
}

const run = async () => {
	await connectDb()

	await seedAdminUser()
	await seedTechStackGroups()

	if (process.env.SEED_PROJECTS !== "false") await seedProjects()
	else line("SEED_PROJECTS=false - project import skipped")

	if (process.env.SEED_EXPERIENCE !== "false") await seedExperience()
	else line("SEED_EXPERIENCE=false - work-experience import skipped")

	await mongoose.disconnect()
	line("Done")
}

run().catch(async error => {
	console.error(`[seed] Failed: ${error.message}`)
	await mongoose.disconnect().catch(() => {})
	process.exit(1)
})
