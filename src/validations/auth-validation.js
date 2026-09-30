import * as yup from "yup"
import { optionalText } from "./common-validation.js"

const loginSchema = yup.object({
	email: yup
		.string()
		.trim()
		.lowercase()
		.required("Email is required")
		.email("Please enter a valid email address"),
	password: yup.string().required("Password is required"),
})

const changePasswordSchema = yup.object({
	currentPassword: yup.string().required("Your current password is required"),
	password: yup
		.string()
		.required("A new password is required")
		.min(8, "Use at least 8 characters")
		.matches(/[a-z]/, "Include at least one lowercase letter")
		.matches(/[A-Z]/, "Include at least one uppercase letter")
		.matches(/[0-9]/, "Include at least one number"),
	passwordConfirmation: yup
		.string()
		.required("Please confirm the new password")
		.oneOf([yup.ref("password")], "Passwords do not match"),
})

const profileSchema = yup.object({
	name: yup.string().trim().required("Name is required").min(2, "Name is too short"),
	email: yup
		.string()
		.trim()
		.lowercase()
		.required("Email is required")
		.email("Please enter a valid email address"),
	role: yup.string().trim().oneOf(["admin", "editor"]).default("admin"),
	isActive: yup.boolean().default(true),
})

const createUserSchema = profileSchema.shape({
	password: yup
		.string()
		.required("Password is required")
		.min(8, "Use at least 8 characters")
		.matches(/[a-z]/, "Include at least one lowercase letter")
		.matches(/[A-Z]/, "Include at least one uppercase letter")
		.matches(/[0-9]/, "Include at least one number"),
})

// Only used to keep the payload shape explicit for the profile endpoint.
const noteSchema = yup.object({ note: optionalText(500) })

export { loginSchema, changePasswordSchema, profileSchema, createUserSchema, noteSchema }
