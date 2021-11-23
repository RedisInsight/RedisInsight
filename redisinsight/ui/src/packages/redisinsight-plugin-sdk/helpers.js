/**
 * helper function to send postMessage to the main app
 *
 * @param data
 */
export const sendMessageToMain = (data = {}) => {
  window.top.postMessage(data, '*')
}
