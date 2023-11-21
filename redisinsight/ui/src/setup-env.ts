process.env.BASE_API_URL = 'http://localhost'
process.env.RESOURCES_BASE_URL = 'http://localhost'
process.env.RI_APP_PORT = '5001'
process.env.API_PREFIX = 'api'

window.app = {
  ...window.app,
  config: {
    apiPort: '5001',
  }
}
