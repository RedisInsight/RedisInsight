import axios from 'axios'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

const baseApiUrl = process.env.BASE_API_URL
const apiPort = process.env.API_PORT
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.APP_ENV === 'web'

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
