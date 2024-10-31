import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'

import { createServer } from 'net'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { getWindows } from '../window'
import { importApiModule } from 'desktopSrc/api-imports'

const port = config.defaultPort

let gracefulShutdown: Function
let beApp: any
export const launchApiServer = async () => {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.RI_APP_TYPE === 'electron') {
      // Define auth port
      const TCP_LOCAL_AUTH_PORT = process.env.TCP_LOCAL_AUTH_PORT ? parseInt(process.env.TCP_LOCAL_AUTH_PORT, 10) : 5541

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
    } else {
      // Production code
      const server = importApiModule('dist/src/main').default
      const detectPortConst = await getPort({ port: portNumbers(port, port + 1_000) })
      process.env.RI_APP_PORT = detectPortConst?.toString()
  
      if (process.env.APPIMAGE) {
        process.env.BUILD_PACKAGE = 'appimage'
      }
  
      log.info('Starting server with port:', detectPortConst)
      log.info('Environment:', process.env.NODE_ENV)
      log.info('App type:', process.env.RI_APP_TYPE)
  
      const { gracefulShutdown: gracefulShutdownFn, app: apiApp } = await server(detectPortConst)
      gracefulShutdown = gracefulShutdownFn
      beApp = apiApp
    }

  } catch (error) {
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
    log.error('Server initialization error:', error)
    log.error('Error stack:', error.stack)
    throw error
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
