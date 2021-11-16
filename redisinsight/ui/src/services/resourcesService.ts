import axios from 'axios'

const baseApiUrl = process.env.BASE_API_URL
const apiPort = process.env.API_PORT
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.APP_ENV === 'web'

export const RESOURCES_BASE_URL = !isDevelopment && isWebApp ? '/' : `${baseApiUrl}:${apiPort}/`
axios.defaults.adapter = require('axios/lib/adapters/http')

export default axios.create({
  baseURL: RESOURCES_BASE_URL,
})
