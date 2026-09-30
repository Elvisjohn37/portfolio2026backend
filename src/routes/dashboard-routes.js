import { Router } from "express"
import { dashboardSummary } from "../controllers/dashboard-controllers.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

router.get("/summary", dashboardSummary)

export default router
