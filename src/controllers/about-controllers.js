import _ from "lodash"
import About from "./../models/about.js"

const getName = async (req, res) => {
	const { id } = req.params
	try {
		const name = await About.findById(id).select("firstName position")
		console.log("name: ", name)
		if (_.isEmpty(name)) return res.status(404).json({ message: "No data available", data: {}, success: false })
		return res.status(200).json({ message: "", data: name, success: true })
	} catch (err) {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

export { getName }
