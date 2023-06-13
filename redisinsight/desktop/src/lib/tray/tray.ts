import { app, Menu, shell, Tray, nativeImage, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { WindowType, getWindows, windowFactory } from 'desktopSrc/lib'
// eslint-disable-next-line import/no-cycle
import { setToQuiting } from './trayManager'

export class TrayBuilder {
  public tray: Tray

  constructor() {
    // eslint-disable-next-line operator-linebreak
    const iconName = process.platform === 'darwin' ? 'icon-tray-white.png' : 'icon-tray-colored.png'
    const iconPath = `${!app.isPackaged ? '../' : ''}../../../resources/`
    const iconFullPath = path.join(__dirname, iconPath, iconName)
    const icon = nativeImage.createFromPath(iconFullPath)
    const iconTray = icon.resize({ height: 16, width: 16 })
    iconTray.setTemplateImage(true)

    this.tray = new Tray(iconTray)
  }

  buildOpenAppSubMenu() {
    if (getWindows()?.size > 1) {
      return {
        label: 'Open RedisInsight',
        type: 'submenu',
        submenu: [
          {
            label: 'All',
            click: () => {
              this.openApp()
            }
          },
          {
            type: 'separator'
          },
          ...[...getWindows().values()].map((window) => ({
            label: window.webContents.getTitle(),
            click: () => {
              window.show()
            }
          }))
        ]
      }
    }

    return {
      label: 'Open RedisInsight',
      click: () => {
        this.openApp()
      }
    }
  }

  buildContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      this.buildOpenAppSubMenu(),
      { type: 'separator' },
      {
        label: 'About',
        click: () => {
          this.openApp()

          app.showAboutPanel()
        }
      },
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://docs.redis.com/latest/ri/')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          setToQuiting()
          app.quit()
        }
      }
    ] as MenuItemConstructorOptions[])

    this.tray.setContextMenu(contextMenu)
  }

  buildTray() {
    this.tray.setToolTip(app.name)
    this.buildContextMenu()

    if (process.platform !== 'darwin') {
      this.tray.on('click', () => {
        this.openApp()
      })
    }

    return this.tray
  }

  updateTooltip(name: string) {
    this.tray.setToolTip(name)
  }

  private openApp() {
    if (getWindows()?.size) {
      getWindows()?.forEach((window: BrowserWindow) => window.show())
      app.dock?.show()
    }

    if (!getWindows()?.size) {
      windowFactory(WindowType.Main)
    }
  }
}
