import { slugify } from "../models/project.js"

/**
 * Returns a slug that is unique for the collection, appending -2, -3, ...
 * when the generated base already exists (two projects may share a name).
 */
const uniqueSlug = async (Model, value, excludeId = null) => {
	const base = slugify(value) || "item"
	let slug = base
	let counter = 1

	const conflictFilter = extra => ({ slug, ...extra, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })

	while (await Model.exists(conflictFilter())) {
		counter += 1
		slug = `${base}-${counter}`
	}

	return slug
}

export default uniqueSlug
