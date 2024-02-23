import axios from 'axios'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

const { apiPort } = window.app.config
const baseApiUrl = process.env.RI_BASE_API_URL
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.RI_APP_TYPE === 'web'

export const RESOURCES_BASE_URL = !isDevelopment && isWebApp ? '/' : `${baseApiUrl}:${apiPort}/`

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
