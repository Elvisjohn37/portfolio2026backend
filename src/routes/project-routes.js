import { Router } from "express"
import {
	listPublicProjects,
	listProjects,
	getProject,
	createProject,
	updateProject,
	deleteProject,
	reorderProjects,
} from "../controllers/project-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { idParam } from "../validations/common-validation.js"
import { projectListQuery, idOrSlugParam } from "../validations/list-validation.js"
import { projectSchema, reorderSchema } from "../validations/project-validation.js"

const router = Router()

// ---- Public ----
router.get("/", listPublicProjects)

// ---- Admin ----
router.get("/manage", requireAuth, validate(projectListQuery, "query"), listProjects)

router.post("/", requireAuth, validate(projectSchema), createProject)

router.patch("/reorder", requireAuth, validate(reorderSchema), reorderProjects)

// Keep this last so "/manage" and "/reorder" are matched first.
router.get("/:id", validate(idOrSlugParam, "params"), getProject)

router.put("/:id", requireAuth, validate(idParam, "params"), validate(projectSchema), updateProject)

router.delete("/:id", requireAuth, validate(idParam, "params"), deleteProject)

export default router
