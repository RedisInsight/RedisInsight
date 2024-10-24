import React from 'react'
import { createRoot } from 'react-dom/client'
import App from 'uiSrc/App'
import Router from 'uiSrc/Router'
import { listenPluginsEvents } from 'uiSrc/plugins/pluginEvents'
import 'uiSrc/styles/base/_fonts.scss'
import 'uiSrc/styles/main.scss'

listenPluginsEvents()

const rootEl = document.getElementById('root')
const root = createRoot(rootEl!)
root.render(
  <Router>
    <App />
  </Router>
)
