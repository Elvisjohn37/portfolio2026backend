import { Router } from "express"
import { getHomeData, getAboutData, getTechStacks, getAboutTechStacks } from "../controllers/about-controllers.js"

const router = Router()

router.get("/tech-stacks", getTechStacks)

router.get("/about-tech-stacks/:techStack", getAboutTechStacks)

router.get("/:id", getHomeData)

router.get("/more-about/:id", getAboutData)

router.get("/", (_req, res) => res.status(200).json({ message: "OKAY" }))

export default router
