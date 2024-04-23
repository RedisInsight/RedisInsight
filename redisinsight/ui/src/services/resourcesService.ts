import axios from 'axios'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

const { apiPort } = window.app?.config || { apiPort: process.env.RI_APP_PORT }
const baseApiUrl = process.env.RI_BASE_API_URL
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.RI_APP_TYPE === 'web'

let BASE_URL = !isDevelopment && isWebApp ? '/' : `${baseApiUrl}:${apiPort}/`

if (window.__RI_PROXY_PATH__) {
  BASE_URL = `${BASE_URL}${window.__RI_PROXY_PATH__}/`
}

export const RESOURCES_BASE_URL = BASE_URL

const resourcesService = axios.create({
  baseURL: RESOURCES_BASE_URL,
})

export const getOriginUrl = () => (IS_ABSOLUTE_PATH.test(RESOURCES_BASE_URL)
  ? RESOURCES_BASE_URL
  : (window?.location?.origin || RESOURCES_BASE_URL))

export const getPathToResource = (url: string = ''): string => {
  try {
    return IS_ABSOLUTE_PATH.test(url) ? url : new URL(url, getOriginUrl()).toString()
  } catch {
    return ''
  }
}

export const checkResourse = async (url: string = '') => resourcesService.head(url)

export default resourcesService
