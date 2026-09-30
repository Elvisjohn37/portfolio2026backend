import mongoose from "mongoose"
import AdminUser from "../models/admin-user.js"
import { extractToken, verifyAccessToken } from "../utils/jwt.js"

const unauthorized = (res, message = "Authentication required") =>
	res.status(401).json({ message, data: {}, success: false })

/**
 * Verifies the JWT (Authorization header or httpOnly auth cookie) and loads
 * the admin from the database, so deactivated accounts lose access instantly
 * instead of waiting for the token to expire.
 */
const requireAuth = async (req, res, next) => {
	const token = extractToken(req)

	if (!token) return unauthorized(res)

	try {
		const payload = verifyAccessToken(token)

		if (!mongoose.isValidObjectId(payload.sub)) return unauthorized(res, "Invalid session")

		const user = await AdminUser.findById(payload.sub)

		if (!user || !user.isActive) return unauthorized(res, "Invalid session")

		req.user = user
		return next()
	} catch (err) {
		if (err.name === "TokenExpiredError")
			return unauthorized(res, "Your session has expired, please sign in again")

		if (err.name === "JsonWebTokenError") return unauthorized(res, "Invalid session")

		return next(err)
	}
}

/** Route guard for actions that only a full admin may perform. */
const requireRole =
	(...roles) =>
	(req, res, next) => {
		if (!req.user) return unauthorized(res)
		if (!roles.includes(req.user.role))
			return res.status(403).json({
				message: "Your role does not allow this action",
				data: {},
				success: false,
			})

		return next()
	}

export { requireAuth, requireRole }
