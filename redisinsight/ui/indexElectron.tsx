import React from 'react'
import { createRoot } from 'react-dom/client'
import AppElectron from 'uiSrc/electron/AppElectron'
import { listenPluginsEvents } from 'uiSrc/plugins/pluginEvents'
import 'uiSrc/styles/base/_fonts.scss'
import 'uiSrc/styles/main.scss'

listenPluginsEvents()

const rootEl = document.getElementById('root')
const root = createRoot(rootEl!)
root.render(<AppElectron />)
