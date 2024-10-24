import React from 'react'
import { createRoot } from 'react-dom/client'
import AppElectron from 'uiSrc/electron/AppElectron'
import { listenPluginsEvents } from 'uiSrc/plugins/pluginEvents'
import 'uiSrc/styles/base/_fonts.scss'
import 'uiSrc/styles/main.scss'

console.log('[Renderer] Starting indexElectron')
const rootEl = document.getElementById('root')
const root = createRoot(rootEl!)

console.log('[Renderer] Setting up window-id listener')
console.log('[Renderer] window.app available:', !!window.app)
console.log('[Renderer] window.app methods:', Object.keys(window.app))

window.app.sendWindowId((_e: any, windowId: string = '') => {
  console.log('[Renderer] Received window-id:', windowId)
  window.windowId = windowId || window.windowId
  listenPluginsEvents()
  root.render(<AppElectron />)
})
