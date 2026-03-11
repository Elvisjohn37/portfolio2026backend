import express from "express"
import cors from "cors"

const app = express()

app.use(cors())

app.get("/", (_req, res) => {
	return res.json({ message: "Hello" })
})

app.listen(8080, () => {
	console.log("Listening to port: ", 8080)
})
