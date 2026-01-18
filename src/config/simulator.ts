export const simulatorConfig = {
  url: process.env.SIMULATOR_URL || "http://127.0.0.1:8000",
  apiKey: process.env.SIMULATOR_API_KEY || "E9Y2LxT4g1hQZ7aD8nR3mWx5P0qK6pV7",
  timeoutMs: Number(process.env.SIMULATOR_TIMEOUT_MS) || 10000,
  retryAttempts: Number(process.env.SIMULATOR_RETRY_ATTEMPTS) || 2  ,
  retryDelayMs: Number(process.env.SIMULATOR_RETRY_DELAY_MS) || 1000,
}

export const DESK_HEIGHT_LIMITS = {
  MIN_MM: 680,
  MAX_MM: 1320,
  MIN_CM: 68,
  MAX_CM: 132,
}
