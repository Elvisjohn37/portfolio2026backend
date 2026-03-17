import _ from "lodash"
import About from "./../models/about.js"

const getHomeData = async (req, res) => {
	const { id } = req.params
	try {
		const name = await About.findById(id).select("firstName position about1 province country")
		if (_.isEmpty(name)) return res.status(404).json({ message: "No data available", data: {}, success: false })
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
		if (_.isEmpty(name)) return res.status(404).json({ message: "No data available", data: {}, success: false })
		return res.status(200).json({ message: "", data: name, success: true })
	} catch (err) {
		return res.status(500).json({ message: "Server error", data: {}, success: false })
	}
}

export { getHomeData, getAboutData }
