import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { CLOUD_AUTH_API_ENDPOINTS, CustomHeaders } from 'uiSrc/constants/api'
import { store } from 'uiSrc/slices/store'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const { apiPort } = window.app?.config || { apiPort: riConfig.api.port }
const isDevelopment = riConfig.app.env === 'development'
const isWebApp = riConfig.app.type === 'web'
const hostedApiBaseUrl = riConfig.api.hostedBaseUrl

let apiPrefix = riConfig.api.prefix

if (window.__RI_PROXY_PATH__) {
  apiPrefix = `${window.__RI_PROXY_PATH__}/${apiPrefix}`
}

export const getBaseUrl = () => (!isDevelopment && isWebApp
  ? `${window.location.origin}/${apiPrefix}/`
  : `${riConfig.api.baseUrl}:${apiPort}/${apiPrefix}/`)

const mutableAxiosInstance: AxiosInstance = axios.create({
  baseURL: hostedApiBaseUrl || getBaseUrl(),
  withCredentials: !!hostedApiBaseUrl,
})

export const setApiCsrfHeader = (token: string) => {
  mutableAxiosInstance.defaults.headers.common[CustomHeaders.CsrfToken] = token
}

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config?.headers) {
    const instanceId = /databases\/([\w-]+)\/?.*/.exec(config.url || '')?.[1]

    if (instanceId) {
      const dbIndex = sessionStorageService.get(`${BrowserStorageItem.dbIndex}${instanceId}`)

      if (isNumber(dbIndex)) {
        config.headers[CustomHeaders.DbIndex] = dbIndex
      }
    }

    if (window.windowId) {
      config.headers[CustomHeaders.WindowId] = window.windowId
    }
  }

  return config
}

export const cloudAuthInterceptor = (error: AxiosError) => {
  const { response, config } = error
  if (response?.status === 401 && config?.url && CLOUD_AUTH_API_ENDPOINTS.includes(config.url as any)) {
    store?.dispatch<any>(logoutUserAction?.())
  }

  return Promise.reject(error)
}

export const hostedAuthInterceptor = (error: AxiosError) => {
  const { response } = error
  if (response?.status === 401 && hostedApiBaseUrl) {
    // provide the current path to redirect back to the same location after login
    window.location.href = `${riConfig.app.unauthenticatedRedirect}${window.location.pathname}`
  }
  return Promise.reject(error)
}

export const connectivityErrorsInterceptor = (error: AxiosError) => {
  const { response } = error
  const responseData = response?.data as {
    message?: string,
    code?: string,
    error?: string
  }

  if (response?.status === 503 && (
    responseData.code === 'serviceUnavailable'
    || responseData.error === 'Service Unavailable'
  )) {
    store?.dispatch<any>(setConnectivityError('The connection to the server has been lost.'))
  }

  return Promise.reject(error)
}

mutableAxiosInstance.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error)
)

mutableAxiosInstance.interceptors.response.use(
  undefined,
  cloudAuthInterceptor
)

mutableAxiosInstance.interceptors.response.use(
  undefined,
  hostedAuthInterceptor
)

mutableAxiosInstance.interceptors.response.use(
  undefined,
  connectivityErrorsInterceptor
)

export default mutableAxiosInstance
