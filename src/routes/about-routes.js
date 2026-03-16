import { Router } from "express"
import { getName } from "../controllers/about-controllers.js"

const router = Router()

router.get("/:id", getName)

export default router
