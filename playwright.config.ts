import { defineConfig, devices } from "@playwright/test"

function getPlaywrightHost(): string {
  return process.env.PLAYWRIGHT_HOST?.trim() || "127.0.0.1"
}

function getPlaywrightPort(): number {
  const raw = process.env.PLAYWRIGHT_PORT?.trim()
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3100
}

function getBaseUrl(): string {
  return process.env.PLAYWRIGHT_BASE_URL || `http://${getPlaywrightHost()}:${getPlaywrightPort()}`
}

function webServerConfig():
  | {
      command: string
      url: string
      reuseExistingServer: boolean
      timeout: number
    }
  | undefined {
  // Si on pointe un environnement externe, on ne lance pas de serveur local.
  if (process.env.PLAYWRIGHT_BASE_URL) return undefined
  if (process.env.PLAYWRIGHT_SKIP_WEBSERVER) return undefined

  const base = {
    url: getBaseUrl(),
    timeout: 180_000,
  }

  if (process.env.PLAYWRIGHT_USE_DEV === "1") {
    return {
      ...base,
      command: `next dev --hostname ${getPlaywrightHost()} --port ${getPlaywrightPort()}`,
      reuseExistingServer: !process.env.CI,
    }
  }

  return {
    ...base,
    command: `next start --hostname ${getPlaywrightHost()} --port ${getPlaywrightPort()}`,
    reuseExistingServer: false,
  }
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: getBaseUrl(),
    trace: "on-first-retry",
  },
  webServer: webServerConfig(),
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
