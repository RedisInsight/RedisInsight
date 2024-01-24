import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { CustomHeaders } from 'uiSrc/constants/api'

const { apiPort } = window.app.config
const baseApiUrl = process.env.RI_BASE_API_URL
const apiPrefix = process.env.RI_API_PREFIX
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.RI_APP_TYPE === 'web'

const axiosInstance = axios.create({
  baseURL:
    !isDevelopment && isWebApp
      ? `${window.location.origin}/${apiPrefix}/`
      : `${baseApiUrl}:${apiPort}/${apiPrefix}/`,
})

export const requestInterceptor = (config: AxiosRequestConfig) => {
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

axiosInstance.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error)
)

export default axiosInstance
