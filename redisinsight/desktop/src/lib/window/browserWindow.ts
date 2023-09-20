import contextMenu from 'electron-context-menu'
import { BrowserWindow } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'
import { configMain as config } from 'desktopSrc/config'
import { updateTray } from 'desktopSrc/lib'
import { resolveHtmlPath } from 'desktopSrc/utils'
import { initWindowHandlers } from './window.handlers'

export const windows = new Map<string, BrowserWindow>()
export const getWindows = () => windows
export const focusWindow = (win: BrowserWindow) => {
  if (win.isMinimized()) win.restore()
  win.focus()
}

export enum WindowType {
  Splash = 'splash',
  Main = 'main'
}

export interface ICreateWindow {
  prevWindow: BrowserWindow | null
  htmlFileName: string
  id?: string
  windowType: WindowType
  options: any
}

export const createWindow = async ({
  prevWindow = null,
  htmlFileName = '',
  windowType = WindowType.Main,
  id = uuidv4(),
  options = {}
}: ICreateWindow) => {
  let x
  let y
  const currentWindow = BrowserWindow.getFocusedWindow()

  if (currentWindow && currentWindow?.getTitle() !== config.splashWindow.title) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition()
    x = currentWindowX + 24
    y = currentWindowY + 24
  }
  const newWindow: BrowserWindow | null = new BrowserWindow({
    ...options,
    x,
    y,
    webPreferences: {
      ...options.webPreferences,
      preload: options.preloadPath
    }
  })

  if (windowType !== WindowType.Main) {
    await newWindow.loadURL(resolveHtmlPath(htmlFileName))
    return newWindow
  }

  newWindow.loadURL(resolveHtmlPath(htmlFileName, options?.parsedDeepLink))

  initWindowHandlers(newWindow, prevWindow, windows, id)

  contextMenu({ window: newWindow, showInspectElement: true })

  windows.set(id, newWindow)

  updateTray(newWindow.webContents.getTitle())

  return newWindow
}

export const windowFactory = async (
  windowType: WindowType,
  prevWindow: BrowserWindow | null = null,
  options?: { parsedDeepLink?: IParsedDeepLink }
): Promise<BrowserWindow> => {
  switch (windowType) {
    case WindowType.Splash:
      return createWindow({
        prevWindow,
        htmlFileName: 'splash.html',
        windowType,
        options: {
          ...config.splashWindow,
          preloadPath: config.preloadPath
        }
      })
    case WindowType.Main:
      return createWindow({
        prevWindow,
        htmlFileName: 'index.html',
        windowType,
        options: {
          ...options,
          ...config.mainWindow,
          preloadPath: config.preloadPath
        }
      })

    default:
      break
  }

  throw Error(`${windowType} is not supported`)
}
