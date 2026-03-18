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
	const id = "69b7b3deae50c7eb975112fd"

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

export { getHomeData, getAboutData, getTechStacks, getAboutTechStacks }
