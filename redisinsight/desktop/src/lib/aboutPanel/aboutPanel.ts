import { app } from 'electron'
import path from 'path'
import { configMain as config } from 'desktopSrc/config'

const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources', 'icon.png')
  : path.join(__dirname, '../resources', 'icon.png')

export const AboutPanelOptions = {
  applicationName: 'Redis Insight',
  applicationVersion: `${app.getVersion() || '2.64.1'}${
    !config.isProduction ? `-dev-${process.getCreationTime()}` : ''
  }`,
  copyright: `Copyright © ${new Date().getFullYear()} Redis Ltd.`,
  iconPath: ICON_PATH
}
