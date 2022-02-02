import axios from 'axios'

const baseApiUrl = process.env.BASE_API_URL
const apiPort = process.env.API_PORT
const apiPrefix = process.env.API_PREFIX
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.APP_ENV === 'web'

axios.defaults.adapter = require('axios/lib/adapters/http')

export default axios.create({
  baseURL:
    !isDevelopment && isWebApp
      ? `${window.location.origin}/api/`
      : `${baseApiUrl}:${apiPort}/${apiPrefix}/`,
})
