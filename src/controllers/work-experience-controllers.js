import WorkExperience from "../models/work-experience.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"

const PROJECT_POPULATE = { path: "projects", select: "name slug thumbnail url" }

/** GET /api/work-experiences - public timeline, newest first. */
const listPublicExperiences = async (_req, res) => {
	try {
		const experiences = await WorkExperience.find({ isPublished: true })
			.sort({ order: 1, startDate: -1 })
			.populate(PROJECT_POPULATE)
			.lean()

		return success(res, { data: { experiences, total: experiences.length } })
	} catch {
		return failure(res)
	}
}

/** GET /api/work-experiences/manage */
const listExperiences = async (req, res) => {
	const { search, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = search
			? {
					$or: [
						{ title: { $regex: escapeRegex(search), $options: "i" } },
						{ company: { $regex: escapeRegex(search), $options: "i" } },
					],
				}
			: {}

		const [experiences, total] = await Promise.all([
			WorkExperience.find(filter).sort(orderBy).skip(skip).limit(take).populate(PROJECT_POPULATE),
			WorkExperience.countDocuments(filter),
		])

		return success(res, {
			data: {
				experiences: experiences.map(experience => experience.toJSON()),
				pagination: buildPagination({ total, page, limit }),
			},
		})
	} catch {
		return failure(res)
	}
}

/** POST /api/work-experiences */
const createExperience = async (req, res) => {
	try {
		const payload = req.validated.body
		const order = payload.order || (await WorkExperience.estimatedDocumentCount())

		const experience = await WorkExperience.create({ ...payload, order })

		return success(res, {
			status: 201,
			message: "Experience added",
			data: { experience: experience.toJSON() },
		})
	} catch {
		return failure(res)
	}
}

/** PUT /api/work-experiences/:id */
const updateExperience = async (req, res) => {
	const { id } = req.validated.params

	try {
		const experience = await WorkExperience.findByIdAndUpdate(id, req.validated.body, {
			new: true,
			runValidators: true,
		})

		if (!experience) return notFound(res, "Experience")

		return success(res, { message: "Experience updated", data: { experience: experience.toJSON() } })
	} catch {
		return failure(res)
	}
}

/** DELETE /api/work-experiences/:id */
const deleteExperience = async (req, res) => {
	const { id } = req.validated.params

	try {
		const experience = await WorkExperience.findByIdAndDelete(id)

		if (!experience) return notFound(res, "Experience")

		return success(res, { message: "Experience removed", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

/** PATCH /api/work-experiences/reorder */
const reorderExperiences = async (req, res) => {
	const { ids } = req.validated.body

	try {
		await WorkExperience.bulkWrite(
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
	listPublicExperiences,
	listExperiences,
	createExperience,
	updateExperience,
	deleteExperience,
	reorderExperiences,
}
