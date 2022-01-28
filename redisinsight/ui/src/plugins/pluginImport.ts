/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable no-restricted-globals */
// @ts-nocheck
export const importPluginScript = () => (config) => {
  const { scriptSrc, stylesSrc, iframeId, modules, baseUrl, appVersion } = JSON.parse(config)
  const events = {
    ERROR: 'error',
    LOADED: 'loaded',
    EXECUTE_COMMAND: 'executeCommand',
    SET_HEADER_TEXT: 'setHeaderText',
    EXECUTE_REDIS_COMMAND: 'executeRedisCommand',
    GET_STATE: 'getState',
    SET_STATE: 'setState'
  }

  Object.defineProperty(globalThis, 'state', {
    value: {
      callbacks: { counter: 0 },
      pluginState: {},
      config: { scriptSrc, stylesSrc, iframeId, baseUrl, appVersion },
      modules
    },
    writable: false
  })

  const { callbacks } = globalThis.state

  const sendMessageToMain = (data = {}) => {
    const event = document.createEvent('Event')
    event.initEvent('message', false, false)
    event.data = data
    event.origin = '*'
    parent.dispatchEvent(event)
  }

  const providePluginSDK = () => {
    globalThis.PluginSDK = {
      setHeaderText: (text) => {
        sendMessageToMain({
          event: events.SET_HEADER_TEXT,
          iframeId,
          text
        })
      },
      setPluginLoadSucceed: () => {
        sendMessageToMain({
          event: events.LOADED,
          iframeId,
        })
      },
      setPluginLoadFailed: (error) => {
        sendMessageToMain({
          event: events.ERROR,
          iframeId,
          error,
        })
      },
      executeRedisCommand: (command = '') => new Promise((resolve, reject) => {
        const { callbacks } = globalThis.state
        callbacks[callbacks.counter] = { resolve, reject }
        sendMessageToMain({
          event: events.EXECUTE_REDIS_COMMAND,
          iframeId,
          command,
          requestId: callbacks.counter++
        })
      }),
      getState: () => new Promise((resolve, reject) => {
        const { callbacks } = globalThis.state
        callbacks[callbacks.counter] = { resolve, reject }
        sendMessageToMain({
          event: events.GET_STATE,
          iframeId,
          requestId: callbacks.counter++
        })
      }),
      setState: (state: any) => new Promise((resolve, reject) => {
        const { callbacks } = globalThis.state
        callbacks[callbacks.counter] = { resolve, reject }
        sendMessageToMain({
          event: events.SET_STATE,
          iframeId,
          state,
          requestId: callbacks.counter++
        })
      })
    }
  }

  const listenEvents = () => {
    const promiseEvents = [
      events.EXECUTE_REDIS_COMMAND,
      events.GET_STATE,
      events.SET_STATE
    ]
    globalThis.onmessage = (e) => {
      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (e.data.event === events.EXECUTE_COMMAND) {
        const { plugin } = globalThis
        // eslint-disable-next-line no-prototype-builtins
        if (!plugin.hasOwnProperty(e.data.method)) {
          return
        }
        const action = plugin[e.data.method]
        if (typeof action === 'function') {
          action(e.data.data)
        }
      }

      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (promiseEvents.includes(e.data.event)) {
        // eslint-disable-next-line no-prototype-builtins
        if (callbacks.hasOwnProperty(e.data.requestId)) {
          const actions = callbacks[e.data.requestId]
          // eslint-disable-next-line no-prototype-builtins
          if (actions && actions.hasOwnProperty(e.data.actionType)) {
            const action = actions[e.data.actionType]
            if (typeof action === 'function') {
              action(e.data.data)
            }
            delete callbacks[e.data.requestId]
          }
        }
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      sendMessageToMain({
        event: 'heightChanged',
        iframeId,
        height: document.body.offsetHeight
      })
    })

    resizeObserver.observe(document.body)

    document.addEventListener('click', () => {
      sendMessageToMain({
        event: 'click',
        iframeId,
      })
    })
  }

  providePluginSDK()
  listenEvents()
}

export const prepareIframeHtml = (config) => {
  const importPluginScriptInner: string = importPluginScript().toString()
  const { scriptSrc, scriptPath, stylesSrc, bodyClass } = config
  const stylesLinks = stylesSrc.map((styleSrc: string) => `<link rel="stylesheet" href=${styleSrc} />`).join('')
  const configString = JSON.stringify(config)

  return `
      <head>
        ${stylesLinks}
        <!-- Forbid XMLHttpRequest (AJAX), WebSocket, fetch(), <a ping> or EventSource -->
        <meta http-equiv="Content-Security-Policy" content="connect-src 'none';">
      </head>
      <body class="${bodyClass}" style="height: fit-content">
        <div id="app"></div>
        <script>
          globalThis.plugin = {}
          ;(${importPluginScriptInner})(\`${configString}\`);
          import(\`${scriptSrc}\`)
              .then((module) => {
                  globalThis.plugin = { ...module.default };
                  globalThis.PluginSDK.setPluginLoadSucceed();
              })
              .catch((e) => {
                  var error = \`${scriptPath} not found. Check if it has been renamed or deleted and try again.\`
                  globalThis.PluginSDK.setPluginLoadFailed(error)
              })
        </script>
        <script src="${scriptSrc}" type="module"></script>
      </body>
`
}
