import { Router } from "express"
import { getName } from "../controllers/about-controllers.js"

const router = Router()

router.get("/:id", getName)

router.get("/", (_req, res) => res.status(200).json({ message: "OKAY" }))

export default router
