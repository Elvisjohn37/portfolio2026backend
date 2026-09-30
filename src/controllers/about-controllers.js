import _ from "lodash"
import About from "./../models/about.js"
import TechStack from "./../models/tech-stack.js"
import AboutTechStack from "./../models/about-tech-stack.js"
import mongoose from "mongoose"

const getHomeData = async (req, res) => {
	const { id } = req.params
	try {
		const name = await About.findById(id).select("firstName position about1 province country")
		if (_.isEmpty(name)) return res.status(200).json({ message: "No data available", data: {}, success: false })
		return res.status(200).json({ message: "", data: name, success: true })
	} catch (err) {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

const getAboutData = async (req, res) => {
	const { id } = req.params
	try {
		const name = await About.findById(id).select(
			"firstName middleName lastName position about2 degree school schoolYear",
		)
		if (_.isEmpty(name)) return res.status(200).json({ message: "No data available", data: {}, success: false })
		return res.status(200).json({ message: "", data: name, success: true })
	} catch (err) {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

const getTechStacks = async (_req, res) => {
	try {
		const name = await TechStack.find()
		if (_.isEmpty(name))
			return res.status(200).json({ message: "No tech stacks available", data: [], success: false })
		return res.status(200).json({ message: "", data: name, success: true })
	} catch (err) {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

const getAboutTechStacks = async (req, res) => {
	let { techStack } = req.params
	techStack = techStack.charAt(0).toUpperCase() + techStack.slice(1)
	const id = process.env.ABOUT_ID || (await About.findOne().select("_id"))?._id

	try {
		if (!mongoose.isValidObjectId(id))
			return res.status(400).json({
				message: "Invalid About ID",
				data: [],
				success: false,
			})

		const techStackId = await TechStack.findOne({ techStack }).select("_id")

		const techStacks = await AboutTechStack.find({ about: id, techStack: techStackId._id })
			.select("name description techStack") // only needed fields
			.populate({
				path: "techStack",
				select: "techStack -_id", // only return the value
			})
			.lean() // 🚀 improves performance (no mongoose docs)

		if (!techStacks.length)
			return res.status(200).json({
				message: "No tech stacks available for this About",
				data: [],
				success: false,
			})

		const data = techStacks.map((item) => ({
			_id: item._id,
			name: item.name,
			description: item.description,
			techStack: item.techStack?.techStack || null, // safe access
		}))

		return res.status(200).json({
			message: "",
			data,
			success: true,
		})
	} catch {
		return res.status(500).json({
			message: "Server error",
			data: {},
			success: false,
		})
	}
}

// ---------------------------------------------------------------------------
// Admin CRUD (all routes below are protected by requireAuth)
// ---------------------------------------------------------------------------

/** GET /api/about - list every profile document (usually just one). */
const listAbout = async (_req, res) => {
	try {
		const profiles = await About.find().sort({ createdAt: 1 })

		return res.status(200).json({
			message: "",
			data: { profiles: profiles.map(profile => profile.toObject()), total: profiles.length },
			success: true,
		})
	} catch {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

/** POST /api/about */
const createAbout = async (req, res) => {
	try {
		const profile = await About.create(req.validated.body)

		return res.status(201).json({
			message: "Profile created",
			data: { profile: profile.toObject() },
			success: true,
		})
	} catch (err) {
		if (err?.name === "ValidationError")
			return res.status(422).json({
				message: "Please check the highlighted fields",
				data: {},
				success: false,
			})

		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

/** PUT /api/about/:id */
const updateAbout = async (req, res) => {
	const { id } = req.validated.params

	try {
		const profile = await About.findByIdAndUpdate(id, req.validated.body, {
			new: true,
			runValidators: true,
		})

		if (!profile)
			return res.status(404).json({ message: "Profile not found", data: {}, success: false })

		return res.status(200).json({
			message: "Profile updated",
			data: { profile: profile.toObject() },
			success: true,
		})
	} catch {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

/** DELETE /api/about/:id */
const deleteAbout = async (req, res) => {
	const { id } = req.validated.params

	try {
		const profile = await About.findByIdAndDelete(id)

		if (!profile)
			return res.status(404).json({ message: "Profile not found", data: {}, success: false })

		await AboutTechStack.deleteMany({ about: id })

		return res.status(200).json({ message: "Profile removed", data: { _id: id }, success: true })
	} catch {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

export {
	getHomeData,
	getAboutData,
	getTechStacks,
	getAboutTechStacks,
	listAbout,
	createAbout,
	updateAbout,
	deleteAbout,
}
