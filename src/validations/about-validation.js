import * as yup from "yup"
import { objectId, optionalText, optionalUrl, order, published } from "./common-validation.js"

const aboutSchema = yup.object({
	firstName: yup.string().trim().required("First name is required").max(80, "First name is too long"),
	middleName: yup.string().trim().default("").max(80, "Middle name is too long"),
	lastName: yup.string().trim().required("Last name is required").max(80, "Last name is too long"),
	position: yup.string().trim().default("").max(120, "Position is too long"),
	about1: optionalText(1200),
	about2: optionalText(2500),
	address: optionalText(200),
	province: optionalText(120),
	country: optionalText(120),
	degree: optionalText(200),
	school: optionalText(200),
	schoolYear: optionalText(80),
	avatar: optionalText(400),
	email: yup
		.string()
		.trim()
		.lowercase()
		.default("")
		.test("is-email-or-empty", "Enter a valid email address", value => !value || yup.string().email().isValidSync(value)),
	phone: optionalText(60),
	github: optionalUrl("GitHub link"),
	linkedin: optionalUrl("LinkedIn link"),
	resumeUrl: optionalText(400),
	yearsOfExperience: yup
		.number()
		.typeError("Years of experience must be a number")
		.min(0, "Cannot be negative")
		.max(80, "That looks too high")
		.default(0),
})

const textBlockSchema = yup.object({
	name: yup.string().trim().required("Name is required").max(80, "Name is too long"),
	description: yup.string().trim().required("Description is required").max(600, "Keep it under 600 characters"),
	about: objectId("About"),
	techStack: objectId("Tech stack group"),
	order,
	isPublished: published,
})

export { aboutSchema, textBlockSchema }
