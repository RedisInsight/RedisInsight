import { initAppHandlers } from './app-handlers'
import { initDialogHandlers } from './dialog-handlers'
import { initIPCHandlers } from './ipc-handlers'
import { initAutoUpdaterHandlers } from './updater-handlers'

export * from './window-handlers'

export const initHandlers = () => {
  initAppHandlers()
  initAutoUpdaterHandlers()
  initIPCHandlers()
  initDialogHandlers()
}
