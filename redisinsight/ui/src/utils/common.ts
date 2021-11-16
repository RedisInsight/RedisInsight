const baseApiUrl = process.env.BASE_API_URL
const resourcesBaseUrl = process.env.RESOURCES_BASE_URL
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.APP_ENV === 'web'
const apiPort = process.env.API_PORT

export const getBaseApiUrl = () => (!isDevelopment && isWebApp
  ? `${resourcesBaseUrl}:${apiPort}`
  : `${baseApiUrl}:${apiPort}`)
