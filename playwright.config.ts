import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	fullyParallel: true,
	retries: 0,
	reporter: "list",
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		viewport: { width: 1280, height: 800 },
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:5173",
		reuseExistingServer: true,
	},
});
