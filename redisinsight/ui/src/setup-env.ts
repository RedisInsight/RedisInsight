import { defaultConfig } from 'uiSrc/config/default'

window.riConfig = defaultConfig

window.app = {
  ...window.app,
  config: {
    apiPort: `${defaultConfig.api.port}`,
  }
}
