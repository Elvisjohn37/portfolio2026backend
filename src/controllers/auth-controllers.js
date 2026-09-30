import AdminUser from "../models/admin-user.js"
import { signAccessToken, getExpiresIn } from "../utils/jwt.js"
import { success, failure, notFound } from "../utils/respond.js"
import { buildListQuery, buildPagination, escapeRegex } from "../utils/query.js"

const INVALID_CREDENTIALS = "Invalid email or password"

/** POST /api/auth/login */
const login = async (req, res) => {
	const { email, password } = req.validated.body
	let stage = "account lookup"

	try {
		const user = await AdminUser.findOne({ email }).select("+password")

		if (!user) return failure(res, { message: INVALID_CREDENTIALS, status: 401 })

		stage = "password verification"
		const passwordMatches = await user.verifyPassword(password)

		// Same message for both cases so the endpoint cannot be used to
		// discover which emails exist.
		if (!passwordMatches) return failure(res, { message: INVALID_CREDENTIALS, status: 401 })

		if (!user.isActive)
			return failure(res, { message: "This account has been deactivated", status: 403 })

		stage = "token signing"
		const token = signAccessToken(user)

		stage = "last login update"
		await AdminUser.updateOne({ _id: user._id }, { lastLoginAt: new Date() })

		stage = "response serialization"
		return success(res, {
			message: "Signed in successfully",
			data: {
				token,
				expiresIn: getExpiresIn(),
				user: user.toSafeJSON(),
			},
		})
	} catch (error) {
		// Keep credentials, tokens, database details, and secret values out of logs.
		console.error("Admin login failed", {
			stage,
			errorType: error?.name || "Error",
			jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
		})
		return failure(res)
	}
}

/** GET /api/auth/me - also used by the admin app to boot the session. */
const me = async (req, res) =>
	success(res, { data: { user: req.user.toSafeJSON() } })

/**
 * POST /api/auth/logout
 * Tokens are stateless, so the client (the admin BFF) clears the cookie.
 * The endpoint exists to keep the flow explicit and to allow future
 * server-side revocation.
 */
const logout = async (_req, res) => success(res, { message: "Signed out" })

/** PUT /api/auth/password */
const changePassword = async (req, res) => {
	const { currentPassword, password } = req.validated.body

	try {
		const user = await AdminUser.findById(req.user._id).select("+password")

		if (!user) return notFound(res, "Account")

		const matches = await user.verifyPassword(currentPassword)

		if (!matches)
			return failure(res, { message: "Your current password is incorrect", status: 400 })

		user.password = password
		await user.save()

		return success(res, { message: "Password updated successfully", data: { user: user.toSafeJSON() } })
	} catch {
		return failure(res)
	}
}

/** PUT /api/auth/profile */
const updateProfile = async (req, res) => {
	const payload = req.validated.body

	try {
		const isAdmin = req.user.role === "admin"
		const changes = { name: payload.name, email: payload.email }

		if (isAdmin) {
			changes.role = payload.role
			changes.isActive = payload.isActive
		}

		const user = await AdminUser.findByIdAndUpdate(req.user._id, changes, {
			new: true,
			runValidators: true,
		})

		if (!user) return notFound(res, "Account")

		return success(res, { message: "Profile updated", data: { user: user.toSafeJSON() } })
	} catch (err) {
		if (err?.code === 11000)
			return failure(res, { message: "That email address is already in use", status: 409 })

		return failure(res)
	}
}

/** GET /api/auth/users - admin only */
const listUsers = async (req, res) => {
	const { search, page, limit, sort } = req.validated.query
	const { skip, limit: take, sort: orderBy } = buildListQuery({ page, limit, sort })

	try {
		const filter = search
			? {
					$or: [
						{ name: { $regex: escapeRegex(search), $options: "i" } },
						{ email: { $regex: escapeRegex(search), $options: "i" } },
					],
				}
			: {}

		const [users, total] = await Promise.all([
			AdminUser.find(filter).sort(orderBy).skip(skip).limit(take),
			AdminUser.countDocuments(filter),
		])

		return success(res, {
			data: {
				users: users.map(user => user.toSafeJSON()),
				pagination: buildPagination({ total, page, limit }),
			},
		})
	} catch {
		return failure(res)
	}
}

/** POST /api/auth/users - admin only */
const createUser = async (req, res) => {
	const { name, email, password, role, isActive } = req.validated.body

	try {
		const user = await AdminUser.create({ name, email, password, role, isActive })

		return success(res, {
			status: 201,
			message: "Team member created",
			data: { user: user.toSafeJSON() },
		})
	} catch (err) {
		if (err?.code === 11000)
			return failure(res, { message: "That email address is already in use", status: 409 })

		return failure(res)
	}
}

/** PUT /api/auth/users/:id - admin only */
const updateUser = async (req, res) => {
	const { id } = req.validated.params

	try {
		if (String(id) === String(req.user._id) && req.validated.body.isActive === false)
			return failure(res, { message: "You cannot deactivate your own account", status: 400 })

		const user = await AdminUser.findByIdAndUpdate(id, req.validated.body, {
			new: true,
			runValidators: true,
		})

		if (!user) return notFound(res, "Team member")

		return success(res, { message: "Team member updated", data: { user: user.toSafeJSON() } })
	} catch (err) {
		if (err?.code === 11000)
			return failure(res, { message: "That email address is already in use", status: 409 })

		return failure(res)
	}
}

/** DELETE /api/auth/users/:id - admin only */
const deleteUser = async (req, res) => {
	const { id } = req.validated.params

	try {
		if (String(id) === String(req.user._id))
			return failure(res, { message: "You cannot delete your own account", status: 400 })

		const user = await AdminUser.findByIdAndDelete(id)

		if (!user) return notFound(res, "Team member")

		return success(res, { message: "Team member removed", data: { _id: id } })
	} catch {
		return failure(res)
	}
}

export {
	login,
	me,
	logout,
	changePassword,
	updateProfile,
	listUsers,
	createUser,
	updateUser,
	deleteUser,
}
