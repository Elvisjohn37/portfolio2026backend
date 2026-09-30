import { failure } from "../utils/respond.js"

/** Terminal 404 for unknown API routes. */
const notFoundHandler = (req, res) =>
	failure(res, {
		message: `Route ${req.method} ${req.originalUrl} does not exist`,
		status: 404,
	})

/** Turns thrown errors (including Mongoose ones) into the shared envelope. */
// eslint-disable-next-line no-unused-vars -- Express identifies handlers by arity
const errorHandler = (err, _req, res, _next) => {
	if (err?.name === "ValidationError") {
		const errors = Object.fromEntries(
			Object.entries(err.errors ?? {}).map(([field, issue]) => [field, issue.message]),
		)

		return failure(res, {
			message: "Please check the highlighted fields",
			errors,
			status: 422,
		})
	}

	if (err?.name === "CastError")
		return failure(res, { message: `Invalid value for "${err.path}"`, status: 400 })

	if (err?.code === 11000) {
		const field = Object.keys(err.keyValue ?? {})[0] ?? "field"
		return failure(res, { message: `That ${field} is already in use`, status: 409 })
	}

	console.error("Unhandled API error:", err)

	return failure(res, { message: "Server error", status: 500 })
}

export { notFoundHandler, errorHandler }
