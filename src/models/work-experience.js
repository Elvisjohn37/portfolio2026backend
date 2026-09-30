import mongoose from "mongoose"

// One entry in the "Work experience" timeline of the portfolio.
const workExperienceSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		company: {
			type: String,
			required: true,
			trim: true,
		},
		// Human readable labels, e.g. "March 2024" / "Present".
		start: {
			type: String,
			required: true,
			trim: true,
		},
		// Machine readable values used by <time dateTime="...">, e.g. "2024-03".
		startDate: {
			type: String,
			default: "",
			trim: true,
		},
		end: {
			type: String,
			default: "Present",
			trim: true,
		},
		endDate: {
			type: String,
			default: "",
			trim: true,
		},
		focus: {
			type: String,
			default: "",
		},
		highlights: {
			type: [String],
			default: [],
		},
		skills: {
			type: [String],
			default: [],
		},
		projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
		order: {
			type: Number,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true, collection: "workexperiences" },
)

// A role without an end date is the current position.
workExperienceSchema.virtual("current").get(function () {
	return !this.endDate
})

workExperienceSchema.set("toJSON", { virtuals: true })

const workExperienceModel = mongoose.model("WorkExperience", workExperienceSchema)

export default workExperienceModel
