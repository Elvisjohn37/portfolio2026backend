import mongoose from "mongoose"

const techStackSchema = new mongoose.Schema(
	{
		techStack: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
)

const techStackModel = mongoose.model("TechStack", techStackSchema)

export default techStackModel
