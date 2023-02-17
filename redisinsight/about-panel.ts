import { app } from 'electron';
import path from 'path';
import { version } from './package.json';

const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources', 'icon.png')
  : path.join(__dirname, '../resources', 'icon.png');

export default {
  applicationName: 'RedisInsight-v2',
  applicationVersion: app.getVersion() || version,
  copyright: `Copyright © ${new Date().getFullYear()} Redis Ltd.`,
  iconPath: ICON_PATH,
};
