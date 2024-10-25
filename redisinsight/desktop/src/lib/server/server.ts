import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'

import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { getWindows } from '../window'

import { importApiModule } from 'desktopSrc/api-imports'

import { createServer } from 'net';
import { spawn } from 'child_process';
import { join } from 'path';

const port = config.defaultPort

let gracefulShutdown: Function
let beApp: any
export const launchApiServer = async () => {
  try {
    // Define auth port
    const AUTH_PORT = 5541;
    
    // Create and start auth server first
    const authServer = createServer((socket) => {
      console.log('Auth server new connection');
      socket.setEncoding('utf8');

      socket.on('data', (data) => {
        console.log('Auth server received data:', data);
        const windowId = data.toString().trim();
        const windows = getWindows();
        console.log('Available windows:', Array.from(windows.keys()));
        const isValid = windows?.has(windowId);
        console.log('Window ID valid:', isValid);
        
        // Write back the validation result
        socket.write(isValid ? '1' : '0', () => {
          console.log('Auth server wrote response:', isValid ? '1' : '0');
          socket.end();
        });
      });

      socket.on('error', (err) => {
        console.error('Auth server socket error:', err);
        socket.end();
      });
    });

    authServer.on('error', (err) => {
      console.log('Auth server error:', err);
    });

    authServer.on('listening', () => {
      console.log('Auth server is listening');
    });

    // Wait for auth server to start
    await new Promise<void>((resolve) => {
      authServer.listen(AUTH_PORT, () => {
        console.log('Auth server listening on port:', AUTH_PORT);
        resolve();
      });
    });

    if (!config.isProduction) {
      return;
    }

    // Production code
    const detectPortConst = await getPort({ port: portNumbers(port, port + 1_000) });
    process.env.RI_APP_PORT = detectPortConst?.toString();

    if (process.env.APPIMAGE) {
      process.env.BUILD_PACKAGE = 'appimage';
    }

    log.info('Available port:', detectPortConst);

    const { gracefulShutdown: gracefulShutdownFn, app: apiApp } = await server(detectPortConst);
    gracefulShutdown = gracefulShutdownFn;
    beApp = apiApp;

  } catch (error) {
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error));
    throw error;
  }
};

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
