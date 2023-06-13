import { app } from 'electron'
import path from 'path'
import { getAssetPath } from 'desktopSrc/utils'
import configInit from '../../config.json'
import pkg from '../../../package.json'

const config: any = configInit

// Merge in some details from package.json
config.name = pkg.productName
config.description = pkg.description
config.version = pkg.version
config.author = pkg.author
config.isDevelopment = process.env.NODE_ENV === 'development'
config.isProduction = process.env.NODE_ENV === 'production'
config.apiPort = process.env.API_PORT || configInit.defaultPort
config.getApiPort = () => process.env.API_PORT || configInit.defaultPort

config.icon = getAssetPath('icon.png')

config.preloadPath = app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../dll/preload.js')

export const configMain = config
