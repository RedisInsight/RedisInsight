import { config } from './config'

// @ts-ignore
riConfig = config

window.app = {
  ...window.app,
  config: {
    apiPort: `${riConfig.api.port}`,
  }
}
