import * as yup from "yup"
import { objectIdArray, optionalText, order, published, stringArray } from "./common-validation.js"

const workExperienceSchema = yup.object({
	title: yup.string().trim().required("Role title is required").max(140, "Role title is too long"),
	company: yup.string().trim().required("Company is required").max(140, "Company name is too long"),
	start: yup.string().trim().required("Start label is required (e.g. \"March 2024\")").max(60),
	startDate: optionalText(20),
	end: yup.string().trim().default("Present").max(60),
	endDate: optionalText(20),
	focus: optionalText(400),
	highlights: stringArray(600),
	skills: stringArray(80),
	projects: objectIdArray("project"),
	isPublished: published,
	order,
})

export { workExperienceSchema }
