import { sendMessageToMain } from './helpers'
import { POST_MESSAGE_EVENTS } from './events'

const { config } = window.state

/**
 * Set text to the header result
 *
 * @param {string} text
 */
export const setHeaderText = (text = '') => {
  sendMessageToMain({
    event: POST_MESSAGE_EVENTS.setHeaderText,
    iframeId: config.iframeId,
    text
  })
}

/**
 * Execute Read-only Redis Command
 * note: For future implementation
 *
 * @param {String} command
 * @param {Function} callback
 */
export const executeRedisCommand = (command = '', callback = () => {}) => {}

/**
 * Set state for the plugin
 * note: For future implementation
 *
 * @param propState
 */
export const setState = (propState = null) => {}

/**
 * Returns the current state
 * note: For future implementation
 *
 * @returns State
 */
export const getState = () => {}
