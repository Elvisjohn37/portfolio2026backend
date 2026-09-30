/**
 * Every route answers with the same envelope the portfolio already consumes:
 * { message, data, success }.
 */
const success = (res, { message = "", data = {}, status = 200 } = {}) =>
	res.status(status).json({ message, data, success: true })

const failure = (
	res,
	{ message = "Server error", data = {}, status = 500, errors = null } = {},
) =>
	res
		.status(status)
		.json({ message, data, success: false, ...(errors ? { errors } : {}) })

/** 404 helper for `findByIdAndUpdate` / `findByIdAndDelete` results. */
const notFound = (res, entity = "Record") =>
	failure(res, { message: `${entity} not found`, status: 404 })

export { success, failure, notFound }
