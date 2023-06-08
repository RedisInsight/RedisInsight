import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ENV_VARS } from 'uiSrc/utils'

const baseApiUrl = ENV_VARS.BASE_API_URL
const apiPort = ENV_VARS.API_PORT
const apiPrefix = ENV_VARS.API_PREFIX
const isDevelopment = ENV_VARS.NODE_ENV === 'development'
const isWebApp = ENV_VARS.APP_ENV === 'web'

axios.defaults.adapter = require('axios/lib/adapters/http')

const axiosInstance = axios.create({
  baseURL:
    !isDevelopment && isWebApp
      ? `${window.location.origin}/api/`
      : `${baseApiUrl}:${apiPort}/${apiPrefix}/`,
})

export const requestInterceptor = (config: AxiosRequestConfig) => {
  if (config?.headers) {
    const instanceId = /databases\/([\w-]+)\/?.*/.exec(config.url || '')?.[1]

    if (instanceId) {
      const dbIndex = sessionStorageService.get(`${BrowserStorageItem.dbIndex}${instanceId}`)

      if (isNumber(dbIndex)) {
        config.headers['ri-db-index'] = dbIndex
      }
    }
  }

  return config
}

axiosInstance.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error)
)

export default axiosInstance
