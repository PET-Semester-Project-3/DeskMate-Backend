/**
 * Custom error types for desk operations
 */

export class SimulatorError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string = "SIMULATOR_ERROR") {
    super(message)
    this.name = "SimulatorError"
    this.code = code
    this.statusCode = 503
  }
}

export class SimulatorTimeoutError extends SimulatorError {
  constructor(deskId: string, timeoutMs: number) {
    super(
      `Simulator request timed out after ${timeoutMs}ms for desk ${deskId}`,
      "SIMULATOR_TIMEOUT"
    )
    this.name = "SimulatorTimeoutError"
  }
}

export class SimulatorConnectionError extends SimulatorError {
  constructor(deskId: string) {
    super(
      `Unable to connect to desk simulator for desk ${deskId}`,
      "SIMULATOR_CONNECTION_ERROR"
    )
    this.name = "SimulatorConnectionError"
  }
}

export class HeightOutOfRangeError extends Error {
  public readonly code: string = "HEIGHT_OUT_OF_RANGE"
  public readonly statusCode: number = 400
  public readonly minHeight: number
  public readonly maxHeight: number
  public readonly attemptedHeight: number

  constructor(attemptedMm: number, minMm: number = 680, maxMm: number = 1320) {
    super(`Height ${attemptedMm}mm is out of valid range (${minMm}-${maxMm}mm)`)
    this.name = "HeightOutOfRangeError"
    this.minHeight = minMm
    this.maxHeight = maxMm
    this.attemptedHeight = attemptedMm
  }
}
