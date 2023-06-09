import path from 'path'
import { app } from 'electron'

export const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../../resources')

  return path.join(RESOURCES_PATH, ...paths)
}
