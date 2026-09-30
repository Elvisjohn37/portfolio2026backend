import About from "../models/about.js"
import TechStack from "../models/tech-stack.js"
import AboutTechStack from "../models/about-tech-stack.js"
import Project from "../models/project.js"
import WorkExperience from "../models/work-experience.js"
import Message from "../models/message.js"
import { success, failure } from "../utils/respond.js"

/** GET /api/dashboard/summary - everything the overview screen needs. */
const dashboardSummary = async (_req, res) => {
	try {
		const [
			projects,
			publishedProjects,
			experiences,
			techStacks,
			aboutBlocks,
			profiles,
			messages,
			unreadMessages,
			starredMessages,
			recentMessages,
			latestProjects,
		] = await Promise.all([
			Project.countDocuments(),
			Project.countDocuments({ isPublished: true }),
			WorkExperience.countDocuments(),
			TechStack.countDocuments(),
			AboutTechStack.countDocuments(),
			About.countDocuments(),
			Message.countDocuments(),
			Message.countDocuments({ status: "new" }),
			Message.countDocuments({ starred: true }),
			Message.find().sort({ createdAt: -1 }).limit(5).lean(),
			Project.find().sort({ updatedAt: -1 }).limit(5).select("name slug thumbnail updatedAt isPublished").lean(),
		])

		return success(res, {
			data: {
				stats: {
					projects,
					publishedProjects,
					drafts: projects - publishedProjects,
					experiences,
					techStacks,
					aboutBlocks,
					profiles,
					messages,
					unreadMessages,
					starredMessages,
				},
				recentMessages,
				latestProjects,
			},
		})
	} catch {
		return failure(res)
	}
}

export { dashboardSummary }
