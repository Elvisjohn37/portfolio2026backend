import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import connectDb from "./config/db.js"
import aboutRouter from "./routes/about-routes.js"
import authRouter from "./routes/auth-routes.js"
import techStackRouter from "./routes/tech-stack-routes.js"
import aboutTechStackRouter from "./routes/about-tech-stack-routes.js"
import projectRouter from "./routes/project-routes.js"
import workExperienceRouter from "./routes/work-experience-routes.js"
import messageRouter from "./routes/message-routes.js"
import dashboardRouter from "./routes/dashboard-routes.js"
import { notFoundHandler, errorHandler } from "./middleware/error-handler.js"

const app = express()

dotenv.config()

const PORT = process.env.PORT || 8080

await connectDb()

// `crossOriginResourcePolicy: false` keeps the API usable from the
// portfolio/admin origins even though responses are JSON only.
app.use(helmet({ crossOriginResourcePolicy: false }))

// The public portfolio and the admin BFF both call the API from browsers.
// Auth travels in the Authorization header (or via the BFF), not cookies, so
// an open CORS policy does not expose the session.
app.use(cors())

app.use(express.json({ limit: "1mb" }))

app.use(cookieParser())

app.get("/api/health", (_req, res) =>
	res.status(200).json({
		message: "OKAY",
		data: { uptime: process.uptime(), env: process.env.NODE_ENV || "development" },
		success: true,
	}),
)

app.use("/api/auth/", authRouter)
app.use("/api/dashboard/", dashboardRouter)
app.use("/api/about/", aboutRouter)
app.use("/api/tech-stacks/", techStackRouter)
app.use("/api/about-tech-stacks/", aboutTechStackRouter)
app.use("/api/projects/", projectRouter)
app.use("/api/work-experiences/", workExperienceRouter)
app.use("/api/messages/", messageRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => console.log("Listening to port: ", PORT))
