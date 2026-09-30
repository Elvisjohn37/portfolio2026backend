import { Router } from "express"
import {
	listBlocks,
	createBlock,
	updateBlock,
	deleteBlock,
} from "../controllers/about-tech-stack-controllers.js"
import { requireAuth } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import { idParam } from "../validations/common-validation.js"
import { blockListQuery } from "../validations/list-validation.js"
import { textBlockSchema } from "../validations/about-validation.js"

const router = Router()

router.use(requireAuth)

router.get("/", validate(blockListQuery, "query"), listBlocks)

router.post("/", validate(textBlockSchema), createBlock)

router.put("/:id", validate(idParam, "params"), validate(textBlockSchema), updateBlock)

router.delete("/:id", validate(idParam, "params"), deleteBlock)

export default router
