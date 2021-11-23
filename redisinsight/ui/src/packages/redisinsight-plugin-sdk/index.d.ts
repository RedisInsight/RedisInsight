/**
 * Set text to the header result
 *
 */
export function setHeaderText(text?: string): void

/**
 * Execute Read-only Redis Command
 * note: For future implementation
 *
 */
export function executeRedisCommand(command?: string, callback?: Function): void

/**
 * Set state for the plugin
 * note: For future implementation
 *
 */
export function setState<State>(propState?: State): void

/**
 * Returns the current state
 * note: For future implementation
 *
 */
export function getState(): any
