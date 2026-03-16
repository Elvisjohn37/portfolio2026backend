import mongoose from "mongoose"

const connectDb = async () => {
	try {
		mongoose.connect(process.env.MONGO_URI)
		console.log("Connected")
	} catch (err) {
		console.log("Connected: ", err)
	}
}

export default connectDb
