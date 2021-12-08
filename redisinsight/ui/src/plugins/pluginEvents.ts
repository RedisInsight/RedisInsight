import { pluginApi } from 'uiSrc/services/PluginAPI'

const dispatchBodyEvent = (mouseEventType: string) => {
  document.querySelector('body')?.dispatchEvent(
    new MouseEvent(mouseEventType, {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1
    })
  )
}

export enum PluginEvents {
  loaded = 'loaded',
  error = 'error',
  heightChanged = 'heightChanged',
  setHeaderText = 'setHeaderText'
}

export const listenPluginsEvents = () => {
  globalThis.onmessage = (e: MessageEvent) => {
    console.log(22222, e.data)
    switch (e.data?.event) {
      case 'loaded': {
        pluginApi.sendEvent(e.data.iframeId, 'loaded')
        break
      }
      case 'error': {
        pluginApi.sendEvent(e.data.iframeId, 'error', e.data.error)
        break
      }
      case 'heightChanged': {
        pluginApi.sendEvent(e.data.iframeId, 'heightChanged', e.data.height)
        break
      }
      case 'executeRedisCommand': {
        // pluginApi.sendEvent(e.data.iframeId, 'executeRedisCommand', {
        //   command: e.data.command,
        //   requestId: e.data.requestId
        // })
        break
      }
      case 'setHeaderText': {
        pluginApi.sendEvent(e.data.iframeId, 'setHeaderText', e.data.text)
        break
      }
      case 'click': {
        // Simulate bubbling from iframe
        ['mousedown', 'click', 'mouseup'].forEach(dispatchBodyEvent)
        break
      }
      default:
    }
  }
}
