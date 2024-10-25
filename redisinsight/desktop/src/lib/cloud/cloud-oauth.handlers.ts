import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getBackendApp, getWindows } from 'desktopSrc/lib'
import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { 
  CloudAuthRequestOptions, 
  CloudAuthResponse, 
  CloudAuthStatus 
} from 'desktopSrc/types/cloud-auth'
import { createConnection } from 'net'
const { DEFAULT_SESSION_ID, DEFAULT_USER_ID } = importApiModule('dist/src/common/constants')
const { CloudOauthUnexpectedErrorException } = importApiModule('dist/src/modules/cloud/auth/exceptions')
const { CloudAuthService } = importApiModule('dist/src/modules/cloud/auth/cloud-auth.service')
import { importApiModule } from 'desktopSrc/api-imports'

const CLOUD_AUTH_PORT = 5542;

const sendTcpRequest = (data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('Sending TCP request with data:', data); // Add this line
    const client = createConnection(CLOUD_AUTH_PORT, 'localhost', () => {
      console.log('Client connected to server');
      client.write(JSON.stringify(data));
    });

    let responseData = '';
    client.on('data', (chunk) => {
      console.log(`Data received from server: ${chunk}`);
      responseData += chunk;
    });

    client.on('end', () => {
      console.log('Disconnected from server');
      try {
        const response = JSON.parse(responseData);
        console.log('Parsed response:', response); // Add this line
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      } catch (err) {
        console.error('Error parsing response:', err); // Add this line
        reject(err);
      }
    });

    client.on('error', (err) => {
      console.error(`Client error:`, err); // Modified this line
      reject(err);
    });
  });
};

export const getOauthIpcErrorResponse = (error: any): { status: CloudAuthStatus.Failed, error: {} } => {
  let errorResponse = new CloudOauthUnexpectedErrorException().getResponse()

  if (error?.getResponse) {
    errorResponse = error.getResponse()
  } else if (error instanceof Error) {
    errorResponse = new CloudOauthUnexpectedErrorException(error.message).getResponse()
  }

  return {
    status: CloudAuthStatus.Failed,
    error: errorResponse,
  }
}

export const getTokenCallbackFunction = (webContents: WebContents) => (response: CloudAuthResponse) => {
  webContents.send(IpcOnEvent.cloudOauthCallback, response)
  webContents.focus()
}

export const initCloudOauthHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.cloudOauth, async (event, options: CloudAuthRequestOptions) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending auth request with options:', {
          sessionMetadata: {
            sessionId: DEFAULT_SESSION_ID,
            userId: DEFAULT_USER_ID,
          },
          authOptions: options
        });

        const { url } = await sendTcpRequest({
          action: 'getAuthUrl',
          options: {
            sessionMetadata: {
              sessionId: DEFAULT_SESSION_ID,
              userId: DEFAULT_USER_ID,
            },
            authOptions: {
              ...options,
              callback: getTokenCallbackFunction(event.sender),
            }
          }
        });

        await open(url);

        return {
          status: CloudAuthStatus.Succeed,
        };
      }

      // Original implementation for non-development environments
      const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)

      if (!authService) {
        throw new Error('Api service doesn\'t support cloud authorization')
      }

      const url = await authService.getAuthorizationUrl({
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
      }, {
        ...options,
        callback: getTokenCallbackFunction(event.sender),
      })

      await open(url)

      return {
        status: CloudAuthStatus.Succeed,
      }
    } catch (e) {
      log.error(wrapErrorMessageSensitiveData(e as Error))

      const error = getOauthIpcErrorResponse(e)

      const [currentWindow] = getWindows().values()

      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, error)

      return {
        status: CloudAuthStatus.Failed,
        error,
      }
    }
  })
}

export const cloudOauthCallback = async (url: UrlWithParsedQuery) => {
  console.log('Handling callback with URL:', url);
  try {
    if (process.env.NODE_ENV === 'development') {
      const { result } = await sendTcpRequest({
        action: 'handleCallback',
        options: {
          query: url.query
        }
      });

      const [currentWindow] = getWindows().values();
      if (result.status === CloudAuthStatus.Failed) {
        currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result);
      }
      return;
    }

    // Original implementation for non-development environments
    const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)
    const result = await authService.handleCallback(url.query)

    if (result.status === CloudAuthStatus.Failed) {
      const [currentWindow] = getWindows().values()

      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
