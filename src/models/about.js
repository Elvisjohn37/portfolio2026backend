import mongoose from "mongoose"

const aboutSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		// Optional per both yup schemas (`aboutSchema`) and existing documents -
		// an empty middle name must be storable, so it is not `required`.
		middleName: {
			type: String,
			default: "",
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		// Hero / about copy. These paths are selected by about-controllers.js,
		// so they have to exist on the schema for the admin panel to write them.
		position: { type: String, default: "", trim: true },
		about1: { type: String, default: "" },
		about2: { type: String, default: "" },
		address: { type: String, default: "", trim: true },
		province: { type: String, default: "", trim: true },
		country: { type: String, default: "", trim: true },
		degree: { type: String, default: "", trim: true },
		school: { type: String, default: "", trim: true },
		schoolYear: { type: String, default: "", trim: true },
		// Optional extras used by the admin panel / future sections.
		avatar: { type: String, default: "", trim: true },
		email: { type: String, default: "", lowercase: true, trim: true },
		phone: { type: String, default: "", trim: true },
		github: { type: String, default: "", trim: true },
		linkedin: { type: String, default: "", trim: true },
		resumeUrl: { type: String, default: "", trim: true },
		yearsOfExperience: { type: Number, default: 0, min: 0 },
	},
	{ timestamps: true, collection: "about" },
)

const aboutModel = mongoose.model("About", aboutSchema)

export default aboutModel
