import axios from 'axios'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { envVars } from 'uiSrc/utils'

const baseApiUrl = envVars.BASE_API_URL
const apiPort = envVars.API_PORT
const isDevelopment = envVars.NODE_ENV === 'development'
const isWebApp = envVars.APP_ENV === 'web'

export const RESOURCES_BASE_URL = !isDevelopment && isWebApp ? '/' : `${baseApiUrl}:${apiPort}/`
axios.defaults.adapter = require('axios/lib/adapters/http')

const resourcesService = axios.create({
  baseURL: RESOURCES_BASE_URL,
})

export const getOriginUrl = () => (IS_ABSOLUTE_PATH.test(RESOURCES_BASE_URL)
  ? RESOURCES_BASE_URL
  : (window?.location?.origin || RESOURCES_BASE_URL))

export const getPathToResource = (url: string = ''): string => (IS_ABSOLUTE_PATH.test(url)
  ? url
  : new URL(url, resourcesService.defaults.baseURL).toString())

export default resourcesService
