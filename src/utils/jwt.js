import jwt from "jsonwebtoken"

/**
 * Name of the httpOnly cookie the admin BFF (portfolio2026admin) sets.
 * The API also accepts the token through an `Authorization: Bearer` header,
 * which keeps it usable from tools such as Swagger/Postman.
 */
export const TOKEN_COOKIE = "portfolio_admin_token"

const DEFAULT_EXPIRES_IN = "1d"

const getSecret = () => {
	const secret = process.env.JWT_SECRET
	if (!secret) throw new Error("JWT_SECRET is not set - check the .env file")
	return secret
}

const getExpiresIn = () => process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN

/**
 * Access tokens carry the admin id in `sub` so a single middleware can load
 * the user (and re-check isActive/role) on every request.
 */
const signAccessToken = user =>
	jwt.sign(
		{
			sub: String(user._id),
			email: user.email,
			role: user.role,
		},
		getSecret(),
		{ expiresIn: getExpiresIn() },
	)

const verifyAccessToken = token => jwt.verify(token, getSecret())

/** Reads the token from the Authorization header or the auth cookie. */
const extractToken = req => {
	const header = req.headers?.authorization || req.get?.("authorization") || ""

	if (header.startsWith("Bearer ")) return header.slice(7).trim()
	if (header.startsWith("bearer ")) return header.slice(7).trim()

	return req.cookies?.[TOKEN_COOKIE] || null
}

export { signAccessToken, verifyAccessToken, extractToken, getExpiresIn }
