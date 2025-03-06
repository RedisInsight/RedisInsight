import React from 'react'
import App from 'uiSrc/App'
import Router from 'uiSrc/RouterElectron'
import { ConfigElectron, ConfigOAuth, ConfigMicrosoftAuth } from './components'

const AppElectron = () => (
  <Router>
    <App>
      <ConfigElectron />
      <ConfigOAuth />
      <ConfigMicrosoftAuth />
    </App>
  </Router>
)

export default AppElectron
