import { config } from './config'

window.riConfig = config

window.app = {
  ...window.app,
  config: {
    apiPort: `${config.api.port}`,
  }
}
