import * as yup from "yup"
import { listQuery, objectId, optionalObjectId, OBJECT_ID_PATTERN } from "./common-validation.js"

/** ?about=&techStack=&search=&page=&limit=&sort= */
const blockListQuery = listQuery.shape({
	about: optionalObjectId("About"),
	techStack: optionalObjectId("Tech stack"),
})

/** ?published=all|true|false */
const publishedFilter = yup
	.string()
	.trim()
	.oneOf(["all", "true", "false"], "Unknown filter")
	.default("all")

const projectListQuery = listQuery.shape({ published: publishedFilter })

/** ?status=new|read|replied|archived|all &starred=all|true|false */
const messageListQuery = listQuery.shape({
	status: yup
		.string()
		.trim()
		.oneOf(["all", "new", "read", "replied", "archived"], "Unknown status")
		.default("all"),
	starred: yup
		.string()
		.trim()
		.oneOf(["all", "true", "false"], "Unknown filter")
		.default("all"),
})

/** Body of the bulk actions (mark read / delete). */
const bulkSchema = yup.object({
	ids: yup
		.array()
		.of(objectId("Id"))
		.min(1, "Select at least one item")
		.required("Select at least one item"),
})

/** Either an ObjectId (admin lookups) or a slug (public lookups). */
const idOrSlugParam = yup.object({
	id: yup
		.string()
		.trim()
		.required("Id or slug is required")
		.max(160)
		.test(
			"is-id-or-slug",
			"Invalid id",
			value => Boolean(value) && (OBJECT_ID_PATTERN.test(value) || /^[a-z0-9-]+$/i.test(value)),
		),
})

export { blockListQuery, projectListQuery, messageListQuery, bulkSchema, idOrSlugParam, publishedFilter }
