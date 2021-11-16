import React from 'react'
import { render } from 'react-dom'
import App from 'uiSrc/App'
import { listenPluginsEvents } from 'uiSrc/plugins/pluginEvents'
import 'uiSrc/styles/base/_fonts.scss'
import 'uiSrc/styles/main.scss'

listenPluginsEvents()

const rootEl = document.getElementById('root')
render(<App />, rootEl)
