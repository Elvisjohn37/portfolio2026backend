import { Router } from "express"
import { getHomeData, getAboutData } from "../controllers/about-controllers.js"

const router = Router()

router.get("/:id", getHomeData)

router.get("/more-about/:id", getAboutData)

router.get("/", (_req, res) => res.status(200).json({ message: "OKAY" }))

export default router
