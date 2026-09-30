import mongoose from "mongoose"

// Messages sent through the contact form of the public portfolio.
const messageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			default: "Portfolio visitor",
			trim: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},
		subject: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["new", "read", "replied", "archived"],
			default: "new",
			index: true,
		},
		starred: {
			type: Boolean,
			default: false,
		},
		repliedAt: {
			type: Date,
			default: null,
		},
		source: {
			type: String,
			default: "portfolio",
		},
		userAgent: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true, collection: "messages" },
)

const messageModel = mongoose.model("Message", messageSchema)

export default messageModel
