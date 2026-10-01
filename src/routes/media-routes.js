import express from "express"
import mongoose from "mongoose"
import { requireAuth } from "../middleware/auth.js"

const Media = mongoose.models.ProjectMedia || mongoose.model("ProjectMedia", new mongoose.Schema({
    bytes: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true }))
const router = express.Router()
const fail = (res, status, message) => res.status(status).json({ success: false, message, data: {} })

export function imageType(bytes) {
    if (!Buffer.isBuffer(bytes) || bytes.length < 12) return null
    if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png"
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg"
    if (["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "image/gif"
    if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp"
    return null
}

router.post("/", requireAuth, express.raw({ type: () => true, limit: "3mb" }), async (req, res) => {
    const contentType = imageType(req.body)
    if (!contentType) return fail(res, 415, "Choose a PNG, JPEG, WebP, or GIF image.")
    try {
        const image = await Media.create({ bytes: req.body, contentType, uploadedBy: req.user._id })
        return res.status(201).json({ success: true, data: { path: `/api/media/${image._id}` } })
    } catch { return fail(res, 500, "Image could not be saved. Please retry.") }
})

router.get("/:id", async (req, res) => {
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return res.sendStatus(404)
    try {
        const image = await Media.findById(req.params.id)
        if (!image) return res.sendStatus(404)
        res.set({ "Content-Type": image.contentType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "cross-origin" })
        return res.send(Buffer.from(image.bytes))
    } catch { return res.sendStatus(500) }
})

router.use((error, _req, res, next) => {
    if (error.type === "entity.too.large") return fail(res, 413, "Each image must be 3 MB or smaller.")
    next(error)
})
export default router
