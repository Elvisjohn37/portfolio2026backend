import { Router } from "express"
import rateLimit from "express-rate-limit"
import {
	createMessage,
	listMessages,
	messageStats,
	getMessage,
	updateMessage,
	bulkUpdateStatus,
	bulkDeleteMessages,
	deleteMessage,
} from "../controllers/message-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { idParam } from "../validations/common-validation.js"
import { messageListQuery, bulkSchema } from "../validations/list-validation.js"
import { createMessageSchema, updateMessageSchema, bulkStatusSchema } from "../validations/message-validation.js"

const router = Router()

// The contact form is public, so keep it throttled (30 per 10 minutes / IP).
// Submissions are forwarded by the portfolio server, so every visitor shares
// the app server's IP - the window has to absorb a realistic burst.
const contactLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 30,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { message: "Too many messages from this device. Please try again later.", data: {}, success: false },
})

// ---- Public: portfolio contact form ----
router.post("/", contactLimiter, validate(createMessageSchema), createMessage)

// ---- Admin inbox ----
router.get("/", requireAuth, validate(messageListQuery, "query"), listMessages)

router.get("/stats", requireAuth, messageStats)

router.put("/bulk/status", requireAuth, validate(bulkStatusSchema), bulkUpdateStatus)

router.post("/bulk/delete", requireAuth, validate(bulkSchema), bulkDeleteMessages)

router.get("/:id", requireAuth, validate(idParam, "params"), getMessage)

router.put("/:id", requireAuth, validate(idParam, "params"), validate(updateMessageSchema), updateMessage)

router.delete("/:id", requireAuth, validate(idParam, "params"), deleteMessage)

export default router
