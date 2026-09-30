import mongoose from "mongoose"
import Project from "../models/project.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"
import uniqueSlug from "../utils/unique-slug.js"

/** GET /api/projects - public, published projects in display order. */
const listPublicProjects = async (_req, res) => {
	try {
		const projects = await Project.find({ isPublished: true })
			.sort({ order: 1, createdAt: 1 })
			.lean()

		return success(res, { data: { projects, total: projects.length } })
	} catch {
		return failure(res)
	}
}

/** GET /api/projects/manage - admin table (search + paging, includes drafts). */
const listProjects = async (req, res) => {
	const { search, published, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = {
			...(published === "all" ? {} : { isPublished: published === "true" }),
			...(search
				? {
						$or: [
							{ name: { $regex: escapeRegex(search), $options: "i" } },
							{ description: { $regex: escapeRegex(search), $options: "i" } },
							{ info: { $regex: escapeRegex(search), $options: "i" } },
						],
					}
				: {}),
		}

		const [projects, total] = await Promise.all([
			Project.find(filter).sort(orderBy).skip(skip).limit(take).lean(),
			Project.countDocuments(filter),
		])

		return success(res, {
			data: { projects, pagination: buildPagination({ total, page, limit }) },
		})
	} catch {
		return failure(res)
	}
}

/** GET /api/projects/:idOrSlug - id for the admin, slug for links. */
const getProject = async (req, res) => {
	const { id } = req.validated.params

	try {
		const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id.toLowerCase() }
		const project = await Project.findOne(query).lean()

		if (!project) return notFound(res, "Project")

		return success(res, { data: { project } })
	} catch {
		return failure(res)
	}
}

/** POST /api/projects */
const createProject = async (req, res) => {
	try {
		const payload = req.validated.body

		// New projects go to the end of the list unless an order is given.
		const order = payload.order || (await Project.estimatedDocumentCount())

		const project = await Project.create({
			...payload,
			order,
			slug: await uniqueSlug(Project, payload.name),
		})

		return success(res, { status: 201, message: "Project created", data: { project: project.toObject() } })
	} catch {
		return failure(res)
	}
}

/** PUT /api/projects/:id */
const updateProject = async (req, res) => {
	const { id } = req.validated.params
	const payload = req.validated.body

	try {
		const project = await Project.findByIdAndUpdate(
			id,
			{ ...payload, slug: await uniqueSlug(Project, payload.name, id) },
			{ new: true, runValidators: true },
		).lean()

		if (!project) return notFound(res, "Project")

		return success(res, { message: "Project updated", data: { project } })
	} catch {
		return failure(res)
	}
}

/** DELETE /api/projects/:id */
const deleteProject = async (req, res) => {
	const { id } = req.validated.params

	try {
		const project = await Project.findByIdAndDelete(id)

		if (!project) return notFound(res, "Project")

		return success(res, { message: "Project removed", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

/** PATCH /api/projects/reorder - persist drag & drop ordering. */
const reorderProjects = async (req, res) => {
	const { ids } = req.validated.body

	try {
		await Project.bulkWrite(
			ids.map((id, index) => ({
				updateOne: { filter: { _id: id }, update: { order: index } },
			})),
		)

		return success(res, { message: "Order saved" })
	} catch {
		return failure(res)
	}
}

export {
	listPublicProjects,
	listProjects,
	getProject,
	createProject,
	updateProject,
	deleteProject,
	reorderProjects,
}
