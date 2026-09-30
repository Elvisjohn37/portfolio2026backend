import mongoose from "mongoose"
import AboutTechStack from "../models/about-tech-stack.js"
import TechStack from "../models/tech-stack.js"
import About from "../models/about.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"

const POPULATE = [
	{ path: "techStack", select: "techStack" },
	{ path: "about", select: "firstName middleName lastName" },
]

/** GET /api/about-tech-stacks */
const listBlocks = async (req, res) => {
	const { about, techStack, search, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = {
			...(about ? { about } : {}),
			...(techStack ? { techStack } : {}),
			...(search
				? {
						$or: [
							{ name: { $regex: escapeRegex(search), $options: "i" } },
							{ description: { $regex: escapeRegex(search), $options: "i" } },
						],
					}
				: {}),
		}

		const [blocks, total] = await Promise.all([
			AboutTechStack.find(filter).sort(orderBy).skip(skip).limit(take).populate(POPULATE).lean(),
			AboutTechStack.countDocuments(filter),
		])

		return success(res, {
			data: { blocks, pagination: buildPagination({ total, page, limit }) },
		})
	} catch {
		return failure(res)
	}
}

/** POST /api/about-tech-stacks */
const createBlock = async (req, res) => {
	const payload = req.validated.body

	try {
		const [about, techStack] = await Promise.all([
			About.findById(payload.about).select("_id"),
			TechStack.findById(payload.techStack).select("_id"),
		])

		if (!about) return failure(res, { message: "About profile not found", status: 400 })
		if (!techStack) return failure(res, { message: "Tech stack group not found", status: 400 })

		const block = await AboutTechStack.create(payload)
		const created = await AboutTechStack.findById(block._id).populate(POPULATE).lean()

		return success(res, { status: 201, message: "Block created", data: { block: created } })
	} catch {
		return failure(res)
	}
}

/** PUT /api/about-tech-stacks/:id */
const updateBlock = async (req, res) => {
	const { id } = req.validated.params

	try {
		if (!mongoose.isValidObjectId(id)) return notFound(res, "Block")

		const block = await AboutTechStack.findByIdAndUpdate(id, req.validated.body, { new: true })
			.populate(POPULATE)
			.lean()

		if (!block) return notFound(res, "Block")

		return success(res, { message: "Block updated", data: { block } })
	} catch {
		return failure(res)
	}
}

/** DELETE /api/about-tech-stacks/:id */
const deleteBlock = async (req, res) => {
	const { id } = req.validated.params

	try {
		const block = await AboutTechStack.findByIdAndDelete(id)

		if (!block) return notFound(res, "Block")

		return success(res, { message: "Block removed", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

export { listBlocks, createBlock, updateBlock, deleteBlock }
