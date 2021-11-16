import { sendMessageToMain } from './helpers'

const { callbacks = { counter: 0 }, pluginState = {}, config } = window.state

/**
 * Set text to the header result
 * note: For future implementation
 *
 * @param {string} text
 */
export const setTextToHeader = (text = '') => {}

/**
 * Execute Read-only Redis Command
 *
 * @param {String} command
 * @param {Function} callback
 */
export const executeRedisCommand = (command = '', callback = () => {}) => {
  callbacks[callbacks.counter] = callback
  sendMessageToMain({
    event: 'executeRedisCommand',
    iframeId: config.iframeId,
    command,
    requestId: callbacks.counter++
  })
}

/**
 * Set state
 * note: For future implementation
 *
 * @param propState
 */
export const setState = (propState = null) => {
  pluginState.value = propState
}

/**
 * Returns current state
 * note: For future implementation
 *
 * @returns State
 */
export const getState = () => pluginState.value
