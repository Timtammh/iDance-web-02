import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/analytics/**", "**/cms/**"],
  use: { baseURL: "http://localhost:5173", headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } } : { channel: "chrome" }) },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  reporter: "list",
});
