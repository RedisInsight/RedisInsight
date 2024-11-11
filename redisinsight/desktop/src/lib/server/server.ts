import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'

import { createServer } from 'net'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { getWindows } from '../window'

import { AbstractWindowAuthStrategy } from '../../../../api/dist/src/modules/auth/window-auth/strategies/abstract.window.auth.strategy'
import { WindowAuthModule } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.module'
import { WindowAuthService } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.service'
import server from '../../../../api/dist/src/main'

const port = config?.defaultPort

export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  async isAuthorized(id: string): Promise<boolean> {
    return getWindows()?.has(id)
  }
}

let gracefulShutdown: Function
let beApp: any
export const launchApiServer = async () => {
  try {
    if (config.isDevelopment) {
      console.log('Launching API server', 1)
      // Define auth port
      const TCP_LOCAL_AUTH_PORT = config.tcpLocalAuthPort

      // Create and start auth server first
      const authServer = createServer((socket) => {
        socket.setEncoding('utf8')

        socket.on('data', (data) => {
          const windowId = data.toString().trim()
          const windows = getWindows()
          const isValid = windows?.has(windowId)

          // Write back the validation result
          socket.write(isValid ? '1' : '0', () => {
            socket.end()
          })
        })

        socket.on('error', () => {
          socket.end()
        })
      })

      authServer.on('error', (err) => {
        log.error('Auth server error:', err)
      })

      authServer.on('listening', () => {
        log.info('Auth server is listening on port:', TCP_LOCAL_AUTH_PORT)
      })

      // Wait for auth server to start
      await new Promise<void>((resolve) => {
        authServer.listen(TCP_LOCAL_AUTH_PORT, () => {
          resolve()
        })
      })
      return
    }
    // Production code
    const detectPortConst = await getPort({ port: portNumbers(port, port + 1_000) })
    process.env.RI_APP_PORT = detectPortConst?.toString()

    if (process.env.APPIMAGE) {
      process.env.BUILD_PACKAGE = 'appimage'
    }

    log.info('Starting server with port:', detectPortConst)
    log.info('Environment:', process.env.NODE_ENV)

    const { gracefulShutdown: gracefulShutdownFn, app: apiApp } = await server(detectPortConst)
    gracefulShutdown = gracefulShutdownFn
    beApp = apiApp
    
    const windowAuthService = beApp?.select?.(WindowAuthModule).get?.(WindowAuthService)
    windowAuthService.setStrategy(new ElectronWindowAuthStrategy())
  } catch (_err) {
    const error = _err as Error
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
    log.error('Server initialization error:', error)
    log.error('Error stack:', error.stack)
    throw error
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
