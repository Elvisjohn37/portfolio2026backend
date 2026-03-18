import mongoose from "mongoose"

const aboutTechStackSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		about: { type: mongoose.Schema.Types.ObjectId, ref: "About" },
		techStack: { type: mongoose.Schema.Types.ObjectId, ref: "TechStack" },
	},
	{ timestamps: true },
)

const aboutTechStackModel = mongoose.model("AboutTechStack", aboutTechStackSchema)

export default aboutTechStackModel
