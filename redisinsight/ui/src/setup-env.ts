process.env.RI_BASE_API_URL = 'http://localhost'
process.env.RI_RESOURCES_BASE_URL = 'http://localhost'
process.env.RI_APP_PORT = '5001'
process.env.RI_API_PREFIX = 'api'

window.app = {
  ...window.app,
  config: {
    apiPort: '5001',
  }
}
