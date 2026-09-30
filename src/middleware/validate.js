import { ValidationError } from "yup"

/**
 * Flattens a yup error into `{ field: "first message" }` so the admin UI can
 * highlight the exact inputs that failed.
 */
const toFieldErrors = error => {
	const issues = error.inner?.length ? error.inner : [error]
	const errors = {}

	for (const issue of issues) {
		const field = issue.path || "_"
		if (!errors[field]) errors[field] = issue.message
	}

	return errors
}

/**
 * Validates (and casts/strips) `req.body`, `req.query` or `req.params`.
 *
 * Express 5 exposes `req.query` as a read-only getter, so the casted value is
 * always stored on `req.validated[source]` and controllers read it from there.
 */
const validate = (schema, source = "body") => async (req, res, next) => {
	try {
		const value = await schema.validate(req[source] ?? {}, {
			abortEarly: false,
			stripUnknown: true,
		})

		req.validated = { ...(req.validated ?? {}), [source]: value }
		return next()
	} catch (err) {
		if (err instanceof ValidationError)
			return res.status(422).json({
				message: "Please check the highlighted fields",
				errors: toFieldErrors(err),
				data: {},
				success: false,
			})

		return next(err)
	}
}

export { validate, toFieldErrors }
export default validate
