import { app } from 'electron'
import path from 'path'
import { getAssetPath } from 'desktopSrc/utils'
import pkg from '../../../package.json'
import configInit from '../../config.json'

const config: any = configInit

// Merge in some details from package.json
config.name = pkg.productName
config.description = pkg.description
config.version = pkg.version
config.author = pkg.author

config.icon = getAssetPath('icon.png')

config.preloadPath = app.isPackaged
  ? path.join(__dirname, 'preload.js')
  : path.join(__dirname, '../../dll/preload.js')

export default config
