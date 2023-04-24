import { app } from 'electron';
import path from 'path';

const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources', 'icon.png')
  : path.join(__dirname, '../resources', 'icon.png');

export default {
  applicationName: 'RedisInsight-v2',
  applicationVersion:
  `${app.getVersion() || '2.24.0'}${process.env.NODE_ENV !== 'production' ? `-dev-${process.getCreationTime()}` : ''}`,
  copyright: `Copyright © ${new Date().getFullYear()} Redis Ltd.`,
  iconPath: ICON_PATH,
};
