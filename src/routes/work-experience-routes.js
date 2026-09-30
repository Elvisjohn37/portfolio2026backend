import { Router } from "express"
import {
	listPublicExperiences,
	listExperiences,
	createExperience,
	updateExperience,
	deleteExperience,
	reorderExperiences,
} from "../controllers/work-experience-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { idParam, listQuery } from "../validations/common-validation.js"
import { workExperienceSchema } from "../validations/work-experience-validation.js"
import { reorderSchema } from "../validations/project-validation.js"

const router = Router()

// ---- Public ----
router.get("/", listPublicExperiences)

// ---- Admin ----
router.get("/manage", requireAuth, validate(listQuery, "query"), listExperiences)

router.post("/", requireAuth, validate(workExperienceSchema), createExperience)

router.patch("/reorder", requireAuth, validate(reorderSchema), reorderExperiences)

router.put("/:id", requireAuth, validate(idParam, "params"), validate(workExperienceSchema), updateExperience)

router.delete("/:id", requireAuth, validate(idParam, "params"), deleteExperience)

export default router
