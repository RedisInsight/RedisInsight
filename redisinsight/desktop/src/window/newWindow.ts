import contextMenu from 'electron-context-menu'
import { BrowserWindow } from 'electron'

import config from 'desktopSrc/config'
import { updateTray } from 'desktopSrc/lib'
import { initWindowHandlers } from 'desktopSrc/handlers'
import { resolveHtmlPath } from 'desktopSrc/utils'

export const windows = new Set<BrowserWindow>()
export const getWindows = () => windows

export const createWindow = async (splash: BrowserWindow | null = null) => {
  let x
  let y
  const currentWindow = BrowserWindow.getFocusedWindow()

  if (currentWindow && currentWindow?.getTitle() !== config.splashWindow.title) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition()
    x = currentWindowX + 24
    y = currentWindowY + 24
  }
  const newWindow: BrowserWindow | null = new BrowserWindow({
    ...config.mainWindow,
    x,
    y,
    webPreferences: {
      ...config.mainWindow.webPreferences,
      preload: config.preloadPath,
    }
  })

  newWindow.loadURL(resolveHtmlPath('index.html'))

  initWindowHandlers(newWindow, splash, windows)

  contextMenu({ window: newWindow, showInspectElement: true })

  windows.add(newWindow)

  updateTray(newWindow.webContents.getTitle())

  return newWindow
}
