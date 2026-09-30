import Message from "../models/message.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"

/** POST /api/messages - used by the portfolio contact form (public). */
const createMessage = async (req, res) => {
	try {
		const message = await Message.create({
			...req.validated.body,
			userAgent: req.get("user-agent") || "",
		})

		return success(res, {
			status: 201,
			message: "Thanks for reaching out - your message was received",
			data: { message: message.toObject() },
		})
	} catch {
		return failure(res)
	}
}

/** GET /api/messages - admin inbox. */
const listMessages = async (req, res) => {
	const { search, status, starred, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = {
			...(status === "all" ? {} : { status }),
			...(starred === "all" ? {} : { starred: starred === "true" }),
			...(search
				? {
						$or: [
							{ name: { $regex: escapeRegex(search), $options: "i" } },
							{ email: { $regex: escapeRegex(search), $options: "i" } },
							{ subject: { $regex: escapeRegex(search), $options: "i" } },
							{ message: { $regex: escapeRegex(search), $options: "i" } },
						],
					}
				: {}),
		}

		const [messages, total] = await Promise.all([
			Message.find(filter).sort(orderBy).skip(skip).limit(take).lean(),
			Message.countDocuments(filter),
		])

		return success(res, {
			data: { messages, pagination: buildPagination({ total, page, limit }) },
		})
	} catch {
		return failure(res)
	}
}

/** GET /api/messages/stats - counters for the sidebar badge + dashboard. */
const messageStats = async (_req, res) => {
	try {
		const [total, unread, starred, replied] = await Promise.all([
			Message.countDocuments(),
			Message.countDocuments({ status: "new" }),
			Message.countDocuments({ starred: true }),
			Message.countDocuments({ status: "replied" }),
		])

		return success(res, { data: { total, unread, starred, replied } })
	} catch {
		return failure(res)
	}
}

/** GET /api/messages/:id */
const getMessage = async (req, res) => {
	const { id } = req.validated.params

	try {
		const message = await Message.findById(id).lean()

		if (!message) return notFound(res, "Message")

		return success(res, { data: { message } })
	} catch {
		return failure(res)
	}
}

/** PUT /api/messages/:id - status / starred toggles. */
const updateMessage = async (req, res) => {
	const { id } = req.validated.params

	try {
		const payload = { ...req.validated.body }

		if (payload.status === "replied") payload.repliedAt = new Date()

		const message = await Message.findByIdAndUpdate(id, payload, { new: true }).lean()

		if (!message) return notFound(res, "Message")

		return success(res, { message: "Message updated", data: { message } })
	} catch {
		return failure(res)
	}
}

/** POST /api/messages/bulk/delete */
const bulkDeleteMessages = async (req, res) => {
	const { ids } = req.validated.body

	try {
		const result = await Message.deleteMany({ _id: { $in: ids } })

		return success(res, {
			message: `${result.deletedCount} message${result.deletedCount === 1 ? "" : "s"} deleted`,
			data: { deletedCount: result.deletedCount },
		})
	} catch {
		return failure(res)
	}
}

/** PUT /api/messages/bulk/status */
const bulkUpdateStatus = async (req, res) => {
	const { status, ids } = req.validated.body

	try {
		const result = await Message.updateMany(
			{ _id: { $in: ids } },
			{ status, ...(status === "replied" ? { repliedAt: new Date() } : {}) },
		)

		return success(res, {
			message: `${result.modifiedCount} message${result.modifiedCount === 1 ? "" : "s"} updated`,
			data: { modifiedCount: result.modifiedCount },
		})
	} catch {
		return failure(res)
	}
}

/** DELETE /api/messages/:id */
const deleteMessage = async (req, res) => {
	const { id } = req.validated.params

	try {
		const message = await Message.findByIdAndDelete(id)

		if (!message) return notFound(res, "Message")

		return success(res, { message: "Message deleted", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

export {
	createMessage,
	listMessages,
	messageStats,
	getMessage,
	updateMessage,
	bulkUpdateStatus,
	bulkDeleteMessages,
	deleteMessage,
}
