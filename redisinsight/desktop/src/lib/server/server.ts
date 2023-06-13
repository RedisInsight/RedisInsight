import detectPort from 'detect-port'
import log from 'electron-log'

import { configMain as config } from 'desktopSrc/config'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import server from '../../../../api/dist/src/main'

const port = config.defaultPort

let backendGracefulShutdown: Function
export const launchApiServer = async () => {
  try {
    const detectPortConst = await detectPort(port)
    process.env.API_PORT = detectPortConst?.toString()
    log.info('Available port:', detectPortConst)
    backendGracefulShutdown = await server()
  } catch (_err) {
    const error = _err as Error
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
  }
}

export const getBackendGracefulShutdown = () => backendGracefulShutdown?.()
