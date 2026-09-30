import mongoose from "mongoose"

const slugify = value =>
	String(value)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")

// Projects embed their technologies (mirroring the `ProjectTechStacks` type the
// portfolio already uses) instead of referencing the About `TechStack` groups,
// which describe the profile's skills rather than individual projects.
const projectTechStackSchema = new mongoose.Schema(
	{
		frontend: { type: [String], default: [] },
		backend: { type: [String], default: [] },
		tools: { type: [String], default: [] },
	},
	{ _id: false },
)

const EMPTY_TECH_STACKS = () => ({ frontend: [], backend: [], tools: [] })

const projectSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
		},
		// Short label shown under the project name ("Admin Website", "E-commerce"...)
		description: {
			type: String,
			default: "",
			trim: true,
		},
		// Long copy shown inside the project dialog.
		info: {
			type: String,
			default: "",
		},
		logoSrc: {
			type: String,
			default: "",
			trim: true,
		},
		thumbnail: {
			type: String,
			default: "",
			trim: true,
		},
		images: {
			type: [String],
			default: [],
		},
		url: {
			type: String,
			default: "",
			trim: true,
		},
		techStacks: { type: projectTechStackSchema, default: EMPTY_TECH_STACKS },
		featured: {
			type: Boolean,
			default: true,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
)

projectSchema.pre("validate", function () {
	if (!this.slug && this.name) this.slug = slugify(this.name)
})

const projectModel = mongoose.model("Project", projectSchema)

export { slugify }
export default projectModel
