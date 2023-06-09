import contextMenu from 'electron-context-menu'
import { BrowserWindow, app } from 'electron'
import path from 'path'

import config from 'desktopSrc/config'
import { updateTray } from 'desktopSrc/lib'
import { initWindowHandlers } from 'desktopSrc/handlers'
import { getAssetPath, resolveHtmlPath } from 'desktopSrc/utils'
import { TITLE_SPLASH } from './splashWindow'

export const windows = new Set<BrowserWindow>()
export const getWindows = () => windows

export const createWindow = async (splash: BrowserWindow | null = null) => {
  let x
  let y
  const currentWindow = BrowserWindow.getFocusedWindow()

  if (currentWindow && currentWindow?.getTitle() !== TITLE_SPLASH) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition()
    x = currentWindowX + 24
    y = currentWindowY + 24
  }
  const newWindow: BrowserWindow | null = new BrowserWindow({
    ...config.mainWindow,
    x,
    y,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      ...config.mainWindow.webPreferences,
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../dll/preload.js')
    }
  })

  newWindow.loadURL(resolveHtmlPath('index.html'))

  initWindowHandlers(newWindow, splash, windows)

  contextMenu({ window: newWindow, showInspectElement: true })

  windows.add(newWindow)

  updateTray(newWindow.webContents.getTitle())

  return newWindow
}
