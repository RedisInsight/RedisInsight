import { BrowserWindow, app } from 'electron'
import { WindowType, getWindows, windowFactory } from 'desktopSrc/lib'

export const showOrCreateWindow = async () => {
  const windows = getWindows()
  console.log('showOrCreateWindow', windows)
  if (windows?.size) {
    windows?.forEach((window: BrowserWindow) => window.show())
    app.dock?.show()
  }

  if (!windows?.size) {
    await windowFactory(WindowType.Main)
  }
}
