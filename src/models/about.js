import mongoose from "mongoose"

const aboutSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		middleName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true, collection: "about" },
)

const aboutModel = mongoose.model("About", aboutSchema)

export default aboutModel
