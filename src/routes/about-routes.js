import { Router } from "express"
import {
	getHomeData,
	getAboutData,
	getTechStacks,
	getAboutTechStacks,
	listAbout,
	createAbout,
	updateAbout,
	deleteAbout,
} from "../controllers/about-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { idParam } from "../validations/common-validation.js"
import { aboutSchema } from "../validations/about-validation.js"

const router = Router()

// ---- Public (consumed by the portfolio frontend) ----
router.get("/tech-stacks", getTechStacks)

router.get("/about-tech-stacks/:techStack", getAboutTechStacks)

router.get("/more-about/:id", getAboutData)

router.get("/:id", getHomeData)

// ---- Admin CRUD ----
router.get("/", requireAuth, listAbout)

router.post("/", requireAuth, validate(aboutSchema), createAbout)

router.put("/:id", requireAuth, validate(idParam, "params"), validate(aboutSchema), updateAbout)

router.delete("/:id", requireAuth, validate(idParam, "params"), deleteAbout)

export default router
