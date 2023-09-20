import { BrowserWindow, app } from 'electron'
import { WindowType, getWindows, windowFactory } from 'desktopSrc/lib'

export const showOrCreateWindow = async () => {
  if (getWindows()?.size) {
    getWindows()?.forEach((window: BrowserWindow) => window.show())
    app.dock?.show()
  }

  if (!getWindows()?.size) {
    await windowFactory(WindowType.Main)
  }
}
