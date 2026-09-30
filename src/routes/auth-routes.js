import { Router } from "express"
import rateLimit from "express-rate-limit"
import {
	login,
	me,
	logout,
	changePassword,
	updateProfile,
	listUsers,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/auth-controllers.js"
import { requireAuth, requireRole } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import {
	loginSchema,
	changePasswordSchema,
	profileSchema,
	createUserSchema,
} from "../validations/auth-validation.js"
import { listQuery, idParam } from "../validations/common-validation.js"

const router = Router()

// Brute-force protection: 10 attempts per IP every 15 minutes.
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { message: "Too many sign-in attempts. Please try again later.", data: {}, success: false },
})

router.post("/login", loginLimiter, validate(loginSchema), login)

router.post("/logout", requireAuth, logout)

router.get("/me", requireAuth, me)

router.put("/profile", requireAuth, validate(profileSchema), updateProfile)

router.put("/password", requireAuth, validate(changePasswordSchema), changePassword)

router.get("/users", requireAuth, requireRole("admin"), validate(listQuery, "query"), listUsers)

router.post(
	"/users",
	requireAuth,
	requireRole("admin"),
	validate(createUserSchema),
	createUser,
)

router.put(
	"/users/:id",
	requireAuth,
	requireRole("admin"),
	validate(idParam, "params"),
	validate(profileSchema),
	updateUser,
)

router.delete(
	"/users/:id",
	requireAuth,
	requireRole("admin"),
	validate(idParam, "params"),
	deleteUser,
)

export default router
