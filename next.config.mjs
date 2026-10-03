/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV !== "development",
	},
	env: {
		BASE_API_URL: process.env.BASE_API_URL,
	},
	reactCompiler: true,
};

export default nextConfig;
