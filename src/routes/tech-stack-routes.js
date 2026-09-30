import { Router } from "express"
import {
	listTechStacks,
	techStackOptions,
	createTechStack,
	updateTechStack,
	deleteTechStack,
} from "../controllers/tech-stack-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { listQuery, idParam } from "../validations/common-validation.js"
import { techStackSchema } from "../validations/project-validation.js"

const router = Router()

// Public: the portfolio selects from this list.
router.get("/options", techStackOptions)

router.get("/all", requireAuth, validate(listQuery, "query"), listTechStacks)

router.post("/", requireAuth, validate(techStackSchema), createTechStack)

router.put("/:id", requireAuth, validate(idParam, "params"), validate(techStackSchema), updateTechStack)

router.delete("/:id", requireAuth, validate(idParam, "params"), deleteTechStack)

export default router
