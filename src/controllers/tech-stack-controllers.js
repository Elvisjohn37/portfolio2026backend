import _ from "lodash"
import TechStack from "../models/tech-stack.js"
import AboutTechStack from "../models/about-tech-stack.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"

/** GET /api/tech-stacks/all */
const listTechStacks = async (req, res) => {
	const { search, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = search
			? { techStack: { $regex: escapeRegex(search), $options: "i" } }
			: {}

		const [techStacks, total] = await Promise.all([
			TechStack.find(filter).sort(orderBy).skip(skip).limit(take),
			TechStack.countDocuments(filter),
		])

		// Usage counts make the list actionable (how many about blocks and
		// projects point at each stack) without extra requests from the UI.
		const usage = await AboutTechStack.aggregate([
			{ $match: { techStack: { $in: techStacks.map(item => item._id) } } },
			{ $group: { _id: "$techStack", total: { $sum: 1 } } },
		])

		const usageMap = new Map(usage.map(item => [String(item._id), item.total]))

		return success(res, {
			data: {
				techStacks: techStacks.map(item => ({
					...item.toObject(),
					usageCount: usageMap.get(String(item._id)) ?? 0,
				})),
				pagination: buildPagination({ total, page, limit }),
			},
		})
	} catch {
		return failure(res)
	}
}

/** GET /api/tech-stacks/options - lightweight list for the admin selects. */
const techStackOptions = async (_req, res) => {
	try {
		const techStacks = await TechStack.find().sort({ techStack: 1 }).select("techStack")

		if (_.isEmpty(techStacks))
			return success(res, { message: "No tech stacks available", data: { techStacks: [] } })

		return success(res, { data: { techStacks } })
	} catch {
		return failure(res)
	}
}

/** POST /api/tech-stacks */
const createTechStack = async (req, res) => {
	try {
		const existing = await TechStack.findOne({ techStack: req.validated.body.techStack })

		if (existing)
			return failure(res, { message: "That tech stack already exists", status: 409 })

		const techStack = await TechStack.create(req.validated.body)

		return success(res, {
			status: 201,
			message: "Tech stack created",
			data: { techStack: techStack.toObject() },
		})
	} catch {
		return failure(res)
	}
}

/** PUT /api/tech-stacks/:id */
const updateTechStack = async (req, res) => {
	const { id } = req.validated.params

	try {
		const duplicate = await TechStack.findOne({
			techStack: req.validated.body.techStack,
			_id: { $ne: id },
		})

		if (duplicate)
			return failure(res, { message: "That tech stack already exists", status: 409 })

		const techStack = await TechStack.findByIdAndUpdate(id, req.validated.body, { new: true })

		if (!techStack) return notFound(res, "Tech stack")

		return success(res, { message: "Tech stack updated", data: { techStack: techStack.toObject() } })
	} catch {
		return failure(res)
	}
}

/** DELETE /api/tech-stacks/:id */
const deleteTechStack = async (req, res) => {
	const { id } = req.validated.params

	try {
		const linked = await AboutTechStack.countDocuments({ techStack: id })

		if (linked)
			return failure(res, {
				message: `This stack is used by ${linked} about ${linked === 1 ? "block" : "blocks"}. Move or remove them first.`,
				status: 409,
			})

		const techStack = await TechStack.findByIdAndDelete(id)

		if (!techStack) return notFound(res, "Tech stack")

		return success(res, { message: "Tech stack removed", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

export { listTechStacks, techStackOptions, createTechStack, updateTechStack, deleteTechStack }
