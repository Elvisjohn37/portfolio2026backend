import * as yup from "yup"

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/

/** Mongoose ObjectId as a string. */
const objectId = (label = "Id") =>
	yup
		.string()
		.trim()
		.matches(OBJECT_ID_PATTERN, `${label} is not valid`)
		.required(`${label} is required`)

/** Free text that may legitimately be empty (empty string clears the field). */
const optionalText = (max = 5000) =>
	yup
		.string()
		.trim()
		.max(max, `Must be ${max} characters or fewer`)
		.default("")

/** ObjectId filter that accepts an empty string ("no filter"). */
const optionalObjectId = (label = "Id") =>
	yup
		.string()
		.trim()
		.default("")
		.test("is-object-id-or-empty", `${label} is not valid`, value => !value || OBJECT_ID_PATTERN.test(value))

/** Absolute http(s) URL, or an empty string when the field is not set. */
const optionalUrl = (label = "URL") =>
	yup
		.string()
		.trim()
		.default("")
		.test(
			"is-url-or-empty",
			`${label} must be a valid link starting with http:// or https://`,
			value => !value || /^https?:\/\/[^\s]+$/i.test(value),
		)

/** 24-hex ids coming from the admin multi-selects. */
const objectIdArray = (label = "id") =>
	yup
		.array()
		.of(objectId(label))
		.default([])

const stringArray = (max = 500) =>
	yup
		.array()
		.of(yup.string().trim().max(max, `Each entry must be ${max} characters or fewer`).required("Entries cannot be empty"))
		.default([])

const order = yup.number().typeError("Order must be a number").integer("Order must be a whole number").default(0)

const published = yup.boolean().default(true)

const listQuery = yup.object({
	search: yup.string().trim().default(""),
	page: yup.number().typeError("Page must be a number").min(1).default(1),
	limit: yup.number().typeError("Limit must be a number").min(1).max(100).default(20),
	sort: yup.string().trim().default("-createdAt"),
})

const idParam = yup.object({ id: objectId("Id") })

export {
	objectId,
	optionalObjectId,
	optionalText,
	optionalUrl,
	objectIdArray,
	stringArray,
	order,
	published,
	listQuery,
	idParam,
	OBJECT_ID_PATTERN,
}
