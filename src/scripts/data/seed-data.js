/**
 * Data that used to be hardcoded in the portfolio frontend
 * (app/utils/js/projects.ts and app/components/WorkExperience.tsx).
 * `npm run seed` imports it into MongoDB so the admin panel can manage it.
 */
export const TECH_STACK_GROUPS = [
	{ techStack: "Frontend", order: 0 },
	{ techStack: "Backend", order: 1 },
	{ techStack: "Tools", order: 2 },
]

const REACT_ADMIN_STACK = {
	frontend: ["Reactjs", "MaterialUi", "Css", "Html", "Javascript", "Typescript", "Jest", "Sass"],
	backend: ["Laravel", "PHP", "Nodejs", "Expressjs", "Mysql", "Mongodb"],
	tools: ["Docker", "Bitbucket", "Jira", "Jenkins"],
}

const LARAVEL_BACKEND = ["Laravel", "PHP", "Nodejs", "Expressjs", "Mysql", "Mongodb"]
const LARAVEL_TOOLS = ["Docker", "Github", "Jira", "Jenkins"]

const GAMING_INFO =
	"Online gaming casino platform, designed exclusively for players across Indonesia. Our website offers a secure, fast, and immersive gaming experience featuring popular slot games, live casino tables, sports betting, and exciting jackpot opportunities. Built with user-friendly navigation and mobile compatibility, players can enjoy seamless access anytime, anywhere within Indonesia."

const LANDERS_INFO =
	"Landers offers a wide variety of local and imported products including groceries, household items, personal care, and specialty goods in spacious, well-organized aisles, similar to other membership club formats."

export const SEED_PROJECTS = [
	{
		name: "Streamline Verify",
		description: "Admin Website",
		logoSrc: "/projects/elgada/streameline verify/favicon.webp",
		thumbnail: "/projects/elgada1.png",
		images: [
			"/projects/elgada2.png",
			"/projects/elgada3.png",
			"/projects/elgada4.png",
			"/projects/elgada5.png",
			"/projects/elgada6.png",
			"/projects/elgada7.png",
			"/projects/elgada8.png",
			"/projects/elgada9.png",
			"/projects/elgada10.png",
		],
		info: "This is an admin website of employee records, organization records, etc.",
		url: "",
		techStacks: REACT_ADMIN_STACK,
	},
	{
		name: "Landers Admin Website",
		description: "Admin Website",
		logoSrc: "/projects/landers/favicon.ico",
		thumbnail: "/projects/landers_admin.png",
		images: [],
		info: LANDERS_INFO,
		url: "https://admin.snapmart.ph",
		techStacks: REACT_ADMIN_STACK,
	},
	{
		name: "Landers",
		description: "E-commerce",
		logoSrc: "/projects/landers/favicon.ico",
		thumbnail: "/projects/landers1.png",
		images: [
			"/projects/landers2.png",
			"/projects/landers3.png",
			"/projects/landers4.png",
			"/projects/landers5.png",
		],
		info: LANDERS_INFO,
		url: "http://landers.ph",
		techStacks: REACT_ADMIN_STACK,
	},
	{
		name: "SBOBET Classic games",
		description: "Online Gaming",
		logoSrc: "/projects/leekie/sbobet/favicon.ico",
		thumbnail: "/projects/sbobet_asi.png",
		images: ["/projects/sbobet_bsi.png"],
		info: GAMING_INFO,
		url: "https://games.classicku.com",
		techStacks: {
			frontend: ["Reactjs", "MaterialUi", "Css", "Html", "Javascript", "Typescript", "Jest", "Nextjs", "Tailwindcss"],
			backend: LARAVEL_BACKEND,
			tools: LARAVEL_TOOLS,
		},
	},
	{
		name: "GOSDSB",
		description: "Online Gaming",
		logoSrc: "/projects/leekie/gosdsb/favicon.png",
		thumbnail: "/projects/gosdsb_bsi.png",
		images: ["/projects/gosdsb_asi.png", "/projects/gosdsb_reports.png"],
		info: GAMING_INFO,
		url: "https://gosdsb.com",
		techStacks: {
			frontend: ["Reactjs", "MaterialUi", "Css", "Html", "Javascript", "Typescript", "Sass", "Jest", "Vitejs"],
			backend: LARAVEL_BACKEND,
			tools: ["Docker", "Github", "Trello", "Jenkins"],
		},
	},
	{
		name: "GOBETX",
		description: "Online Gaming",
		logoSrc: "/projects/leekie/gobetx/favicon.png",
		thumbnail: "/projects/gobetx_asi.png",
		images: ["/projects/gobetx_games.png", "/projects/gobetx_account.png"],
		info: GAMING_INFO,
		url: "https://gobetx.com",
		techStacks: {
			frontend: ["Reactjs", "MaterialUi", "Css", "Html", "Javascript", "Typescript", "Sass", "Jest", "Webpack"],
			backend: LARAVEL_BACKEND,
			tools: LARAVEL_TOOLS,
		},
	},
	{
		name: "338a",
		description: "Online Gaming",
		logoSrc: "/projects/leekie/338a/favicon.png",
		thumbnail: "/projects/338a_bsi.png",
		images: ["/projects/338a_account.png", "/projects/338a_asi.png", "/projects/338a_reports.png"],
		info: GAMING_INFO,
		url: "https://338a.com",
		techStacks: {
			frontend: ["Vuejs", "Bootstrap", "Css", "Html", "Javascript", "Typescript", "Sass", "Gulp"],
			backend: LARAVEL_BACKEND,
			tools: LARAVEL_TOOLS,
		},
	},
]

// `projectNames` links each role to the seeded projects (resolved by name).
export const SEED_EXPERIENCE = [
	{
		title: "AI Engineer",
		company: "Elgada BPO Solutions Inc.",
		start: "March 2024",
		startDate: "2024-03",
		end: "Present",
		endDate: "",
		focus: "Modern web development, powered by AI-assisted engineering.",
		highlights: [
			"Redesign and rebuild legacy websites with React, focusing on maintainability, responsive design, and user experience.",
			"Use Claude AI, GitHub Copilot, and OpenAI Codex for development, code analysis, debugging, and refactoring.",
			"Integrate RESTful APIs, GraphQL, and third-party services; collaborate with designers and project owners on iterative improvements.",
			"Contribute to CI/CD, testing, QA, code reviews, and Agile delivery across browsers and devices.",
		],
		skills: ["AI-assisted development", "REST APIs", "GraphQL", "CI/CD"],
		projectNames: ["Streamline Verify"],
	},
	{
		title: "Frontend Web Developer",
		company: "Snapmart Incorporated",
		start: "April 2023",
		startDate: "2023-04",
		end: "March 2024",
		endDate: "2024-03",
		focus: "React interfaces and the modernization of established applications.",
		highlights: [
			"Developed React-based interfaces and managed application state using modern frontend patterns.",
			"Modernized legacy web applications and improved frontend maintainability while adapting to the team's stack and workflows.",
			"Worked toward delivery milestones, participated in field testing, and resolved implementation issues.",
		],
		skills: ["State management", "Legacy modernization", "Field testing"],
		projectNames: ["Landers Admin Website", "Landers"],
	},
	{
		title: "Senior Fullstack Web Developer",
		company: "Leekie Enterprises Incorporated",
		start: "October 2018",
		startDate: "2018-10",
		end: "April 2023",
		endDate: "2023-04",
		focus: "Full-stack delivery for online gaming applications.",
		highlights: [
			"Built frontend-heavy applications with React, Vue, SASS, Webpack, and Material UI, alongside backend functionality in PHP, Laravel, Node.js, and Express.",
			"Translated design mockups and workflows into responsive, cross-browser interfaces in collaboration with UI/UX stakeholders.",
			"Maintained and optimized production applications through patching, debugging, and performance tuning, with attention to security and stability.",
		],
		skills: ["Performance tuning"],
		projectNames: ["SBOBET Classic games", "GOSDSB", "GOBETX", "338a"],
	},
]

