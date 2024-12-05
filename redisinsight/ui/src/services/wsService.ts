import { io } from 'socket.io-client'
import { getProxyPath } from 'uiSrc/utils'
import { CustomHeaders } from 'uiSrc/constants/api'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

type Params = {
  forceNew?: boolean,
  token?: string,
  reconnection?: boolean
  query?: Record<string, any>
  extraHeaders?: Record<string, any>
}

export function wsService(wsUrl: string, {
  forceNew = true,
  token,
  reconnection,
  query,
  extraHeaders
}: Params, passTokenViaHeaders: boolean = true,) {
  let queryParams: Record<string, any> = !passTokenViaHeaders ? { [CustomHeaders.CsrfToken]: token } : {}
  if (query) {
    queryParams = { ...queryParams, ...query }
  }
  let headers: Record<string, any> = { [CustomHeaders.WindowId]: window.windowId || '' }
  if (passTokenViaHeaders) {
    headers = { ...headers, [CustomHeaders.CsrfToken]: token || '' }
  }

  if (extraHeaders) {
    headers = { ...headers, ...extraHeaders }
  }
  const ioOptions = {
    path: getProxyPath(),
    forceNew,
    reconnection,
    query: queryParams,
    extraHeaders: headers,
    rejectUnauthorized: false,
    transports: riConfig.api.socketTransports?.split(','),
    withCredentials: riConfig.api.socketCredentials,
    auth: { token }
  }

  return io(wsUrl, ioOptions)
}
