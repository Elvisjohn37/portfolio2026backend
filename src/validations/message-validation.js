import * as yup from "yup"

const createMessageSchema = yup.object({
	name: yup.string().trim().default("Portfolio visitor").max(120, "Name is too long"),
	email: yup
		.string()
		.trim()
		.lowercase()
		.required("Email is required")
		.email("Please enter a valid email address"),
	subject: yup.string().trim().required("Subject is required").max(200, "Subject is too long"),
	message: yup.string().trim().required("Message is required").max(5000, "Message is too long"),
	source: yup.string().trim().default("portfolio"),
})

const updateMessageSchema = yup.object({
	status: yup.string().trim().oneOf(["new", "read", "replied", "archived"], "Unknown status").required("Status is required"),
	starred: yup.boolean().default(false),
})

const bulkStatusSchema = yup.object({
	ids: yup
		.array()
		.of(yup.string().trim().matches(/^[0-9a-fA-F]{24}$/, "Invalid id").required())
		.min(1, "Select at least one message")
		.required("Select at least one message"),
	status: yup
		.string()
		.trim()
		.oneOf(["new", "read", "replied", "archived"], "Unknown status")
		.required("Status is required"),
})

export { createMessageSchema, updateMessageSchema, bulkStatusSchema }
