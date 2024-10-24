import { app } from 'electron'

import init from './app'

const gotTheLock = app.requestSingleInstanceLock() || process.platform === 'darwin'
console.log('gotTheLock', gotTheLock)
// deep link open (win)
if (!gotTheLock) {
  console.log('Didn\'t get the lock. Quiting...')
  app.quit()
} else {
  init()
}
