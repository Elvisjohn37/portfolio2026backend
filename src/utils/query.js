/** "-createdAt" -> { createdAt: -1 } */
const parseSort = (sort = "-createdAt") => {
	const raw = String(sort).trim()
	const field = raw.startsWith("-") ? raw.slice(1) : raw
	return { [field || "createdAt"]: raw.startsWith("-") ? -1 : 1 }
}

/** Turns the validated query object into Mongoose skip/limit/sort options. */
const buildListQuery = ({ page = 1, limit = 20, sort = "-createdAt" } = {}) => ({
	skip: (page - 1) * limit,
	limit,
	sort: parseSort(sort),
	page,
})

const buildPagination = ({ total = 0, page = 1, limit = 20 } = {}) => ({
	total,
	page,
	limit,
	pages: Math.max(1, Math.ceil(total / limit)),
	hasNext: page * limit < total,
	hasPrev: page > 1,
})

/** Prevents user input from being treated as a regular expression. */
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export { parseSort, buildListQuery, buildPagination, escapeRegex }
