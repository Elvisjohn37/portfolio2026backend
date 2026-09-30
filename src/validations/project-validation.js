import * as yup from "yup"
import { objectIdArray, optionalText, optionalUrl, order, published, stringArray } from "./common-validation.js"
import { objectId } from "./common-validation.js"
const techStackSchema = yup.object({
	techStack: yup.string().trim().required("Tech stack name is required").max(60, "Keep it under 60 characters"),
	order,
})

const projectTechStacksSchema = yup.object({
	frontend: stringArray(60),
	backend: stringArray(60),
	tools: stringArray(60),
})

const projectSchema = yup.object({
	name: yup.string().trim().required("Project name is required").max(140, "Project name is too long"),
	description: yup.string().trim().default("").max(140, "Description is too long"),
	info: optionalText(3000),
	logoSrc: optionalText(400),
	thumbnail: optionalText(400),
	images: stringArray(400),
	url: optionalUrl("Project link"),
	techStacks: projectTechStacksSchema.default(() => ({ frontend: [], backend: [], tools: [] })),
	featured: yup.boolean().default(true),
	isPublished: published,
	order,
})

const reorderSchema = yup.object({
	ids: yup
		.array()
		.of(objectId("Project"))
		.min(1, "Nothing to reorder")
		.required("Nothing to reorder"),
})

export { techStackSchema, projectSchema, reorderSchema }
