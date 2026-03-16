import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import aboutRouter from "./routes/about-routes.js"
import cors from "cors"

const app = express()

dotenv.config()

const PORT = process.env.PORT || 8080

connectDb()

app.use(cors())

app.use(express.json())

app.use("/api/about/", aboutRouter)

app.listen(PORT, () => console.log("Listening to port: ", PORT))
