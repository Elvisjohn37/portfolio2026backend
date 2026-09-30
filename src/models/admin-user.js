import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

const adminUserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		// Never returned by default - controllers opt in with .select("+password").
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		role: {
			type: String,
			enum: ["admin", "editor"],
			default: "admin",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLoginAt: {
			type: Date,
			default: null,
		},
		passwordChangedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true, collection: "adminusers" },
)

// Hash whenever a plain password is assigned (create or password change).
adminUserSchema.pre("save", async function () {
	if (!this.isModified("password")) return
	this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
	this.passwordChangedAt = new Date()
})

adminUserSchema.methods.verifyPassword = function (plainPassword) {
	if (!this.password) return Promise.resolve(false)
	return bcrypt.compare(plainPassword, this.password)
}

// Shape that is safe to send over the wire (no hash, no internals).
adminUserSchema.methods.toSafeJSON = function () {
	return {
		_id: this._id,
		name: this.name,
		email: this.email,
		role: this.role,
		isActive: this.isActive,
		lastLoginAt: this.lastLoginAt,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
	}
}

const adminUserModel = mongoose.model("AdminUser", adminUserSchema)

export default adminUserModel
