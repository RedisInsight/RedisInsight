import React from 'react'
import App from 'uiSrc/App'
import { ConfigElectron, ConfigOAuth } from './components'

const AppElectron = () => (
  <App>
    <ConfigElectron />
    <ConfigOAuth />
  </App>
)

export default AppElectron
