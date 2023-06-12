import {
  app,
  Menu,
  shell,
  Tray,
  nativeImage,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';
// eslint-disable-next-line import/no-cycle
import { createWindow, setToQuiting, windows } from './main.dev';

export default class TrayBuilder {
  public tray: Tray;

  constructor() {
    const iconRelevantPath = process.platform === 'darwin'
      ? '../resources/icon-tray-white.png'
      : '../resources/icon-tray-colored.png';
    const iconPath = path.join(__dirname, iconRelevantPath);
    const icon = nativeImage.createFromPath(iconPath);
    const iconTray = icon.resize({ height: 16, width: 16 });
    iconTray.setTemplateImage(true);

    this.tray = new Tray(iconTray);
  }

  buildOpenAppSubMenu() {
    if (windows.size > 1) {
      return {
        label: 'Open RedisInsight',
        type: 'submenu',
        submenu: [
          {
            label: 'All',
            click: () => {
              this.openApp();
            },
          },
          {
            type: 'separator',
          },
          ...[...windows].map((window) => ({
            label: window.webContents.getTitle(),
            click: () => {
              window.show();
            },
          })),
        ],
      };
    }

    return {
      label: 'Open RedisInsight',
      click: () => {
        this.openApp();
      },
    };
  }

  buildContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      this.buildOpenAppSubMenu(),
      { type: 'separator' },
      {
        label: 'About',
        click: () => {
          this.openApp();

          app.showAboutPanel();
        },
      },
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://docs.redis.com/latest/ri/');
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          setToQuiting();
          app.quit();
        },
      },
    ] as MenuItemConstructorOptions[]);

    this.tray.setContextMenu(contextMenu);
  }

  buildTray() {
    this.tray.setToolTip(app.name);
    this.buildContextMenu();

    if (process.platform !== 'darwin') {
      this.tray.on('click', () => {
        this.openApp();
      });
    }

    return this.tray;
  }

  updateTooltip(name: string) {
    this.tray.setToolTip(name);
  }

  private openApp() {
    if (windows.size) {
      windows.forEach((window: BrowserWindow) => window.show());
      app.dock?.show();
    }

    if (!windows.size) {
      createWindow();
    }
  }
}
