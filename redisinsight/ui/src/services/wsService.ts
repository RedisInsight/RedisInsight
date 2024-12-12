import { io } from 'socket.io-client'
import path from 'path'
import { getProxyPath } from 'uiSrc/utils'
import { CustomHeaders } from 'uiSrc/constants/api'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

export type WsParams = {
  forceNew?: boolean;
  token?: string;
  reconnection?: boolean;
  query?: Record<string, any>;
  extraHeaders?: Record<string, any>;
}

export function wsService(
  wsUrl: string,
  { forceNew = true, token, reconnection, query, extraHeaders }: WsParams,
  passTokenViaHeaders: boolean = true,
) {
  let queryParams: Record<string, any> = !passTokenViaHeaders
    ? { [CustomHeaders.CsrfToken.toLowerCase()]: token }
    : {}
  if (query) {
    queryParams = { ...queryParams, ...query }
  }
  let headers: Record<string, any> = {
    [CustomHeaders.WindowId]: window.windowId || '',
  }
  if (passTokenViaHeaders) {
    headers = { ...headers, [CustomHeaders.CsrfToken]: token || '' }
  }

  if (extraHeaders) {
    headers = { ...headers, ...extraHeaders }
  }
  const transports = riConfig.api.socketTransports?.split(',')
  const withCredentials = riConfig.api.socketCredentials

  const ioOptions = {
    // addTrailingSlash: false,
    path: '/redis-insight/api/socket.io',
    forceNew,
    reconnection,
    query: queryParams,
    extraHeaders: headers,
    rejectUnauthorized: false,
    transports,
    withCredentials,
    // auth: { token }
  }
  const fullWsUrl = `${wsUrl}/socket.io`
  // eslint-disable-next-line no-console
  console.log({
    wsUrl,
    fullWsUrl,
    passTokenViaHeaders,
    token,
    queryParams,
    headers,
    transports,
    ioOptions,
  })

  return io('https://app-sm.k8s-mw.sm-qa.qa.redislabs.com', ioOptions)
}
