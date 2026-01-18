import { simulatorConfig, DESK_HEIGHT_LIMITS } from "../config/simulator"
import {
  SimulatorError,
  SimulatorTimeoutError,
  SimulatorConnectionError,
  HeightOutOfRangeError,
} from "../errors/DeskErrors"

const { url, apiKey, timeoutMs, retryAttempts, retryDelayMs } = simulatorConfig

interface DeskState {
  position_mm: number
  speed_mms: number
  status: string
  isPositionLost: boolean
  isOverloadProtectionUp: boolean
  isOverloadProtectionDown: boolean
  isAntiCollision: boolean
}

interface DeskConfig {
  name: string
  manufacturer: string
}

interface DeskUsage {
  activationsCounter: number
  sitStandCounter: number
}

interface DeskError {
  time_s: number
  errorCode: number
}

export interface DeskData {
  config: DeskConfig
  state: DeskState
  usage: DeskUsage
  lastErrors: DeskError[]
}

/**
 * Helper function to make a fetch request with timeout
 */
async function fetchWithTimeout(
  fetchUrl: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fetchUrl, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
  finally {
    clearTimeout(timeoutId)
  }
  // em
}

/**
 * Helper function to retry a fetch operation with exponential backoff
 */
async function fetchWithRetry(
  fetchUrl: string,
  options: RequestInit,
  deskId: string,
  attempts: number = retryAttempts
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      const response = await fetchWithTimeout(fetchUrl, options, timeoutMs)
      return response
    } catch (error) {
      lastError = error as Error

      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new SimulatorTimeoutError(deskId, timeoutMs)
      }

      // Check for connection errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (attempt === attempts) {
          throw new SimulatorConnectionError(deskId)
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < attempts) {
        const delay = retryDelayMs * Math.pow(2, attempt)
        console.log(`[Simulator] Retry ${attempt + 1}/${attempts} for desk ${deskId} in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new SimulatorConnectionError(deskId)
}

/**
 * Validate position is within acceptable range
 */
function validatePosition(position_mm: number): void {
  if (
    position_mm < DESK_HEIGHT_LIMITS.MIN_MM ||
    position_mm > DESK_HEIGHT_LIMITS.MAX_MM
  ) {
    throw new HeightOutOfRangeError(
      position_mm,
      DESK_HEIGHT_LIMITS.MIN_MM,
      DESK_HEIGHT_LIMITS.MAX_MM
    )
  }
}

/**
 * Get all desk IDs from the simulator
 */
export async function getAllDeskIds(): Promise<string[]> {
  const response = await fetch(`${url}/api/v2/${apiKey}/desks`)

  if (!response.ok) {
    throw new Error(`Failed to get desk IDs: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<string[]>
}

/**
 * Get full desk data (config, state, usage, lastErrors)
 */
export async function getDeskData(deskId: string): Promise<DeskData> {
  const response = await fetch(`${url}/api/v2/${apiKey}/desks/${deskId}`)

  if (!response.ok) {
    throw new Error(`Failed to get desk data for ${deskId}: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<DeskData>
}

/**
 * Get desk state only (position, speed, status)
 */
export async function getDeskState(deskId: string): Promise<DeskState> {
  const response = await fetch(`${url}/api/v2/${apiKey}/desks/${deskId}/state`)

  if (!response.ok) {
    throw new Error(`Failed to get desk state for ${deskId}: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<DeskState>
}

/**
 * Set desk position in millimeters
 * @param deskId - The desk ID (MAC address format)
 * @param position_mm - Target position in millimeters (680-1320)
 * @throws {HeightOutOfRangeError} If position is outside valid range
 * @throws {SimulatorTimeoutError} If request times out
 * @throws {SimulatorConnectionError} If cannot connect to simulator
 * @throws {SimulatorError} For other simulator errors
 */
export async function setDeskPosition(
  deskId: string,
  position_mm: number
): Promise<{ position_mm: number }> {
  // Validate position before making request
  validatePosition(position_mm)

  const response = await fetchWithRetry(
    `${url}/api/v2/${apiKey}/desks/${deskId}/state`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position_mm }),
    },
    deskId
  )

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "No error details")
    throw new SimulatorError(
      `Failed to set desk position for ${deskId}: ${response.status} ${response.statusText}. ${errorBody}`,
      `SIMULATOR_HTTP_${response.status}`
    )
  }

  return response.json() as Promise<{ position_mm: number }>
}
