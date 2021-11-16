/* eslint-disable sonarjs/no-nested-template-literals */
// @ts-nocheck
export const importPluginScript = () => (config) => {
  const { scriptSrc, stylesSrc, iframeId, modules, baseUrl } = JSON.parse(config)
  const events = {
    EXECUTE_COMMAND: 'executeCommand',
    EXECUTE_REDIS_COMMAND: 'executeRedisCommand'
  }

  Object.defineProperty(globalThis, 'state', {
    value: {
      callbacks: { counter: 0 },
      pluginState: {},
      config: { scriptSrc, stylesSrc, iframeId, baseUrl },
      modules
    },
    writable: false
  })

  const { callbacks } = globalThis.state

  const sendMessageToMain = (data = {}) => {
    globalThis.top.postMessage(data, '*')
  }

  const providePluginSDK = () => {
    globalThis.PluginSDK = {
      setHeaderText: (text) => {
        sendMessageToMain({
          event: 'setHeaderText',
          iframeId,
          text
        })
      }
    }
  }

  const listenEvents = () => {
    globalThis.onmessage = (e) => {
      if (e.data.event === events.EXECUTE_COMMAND) {
        plugin[e.data.method] && plugin[e.data.method](e.data.data)
      }

      if (e.data.event === events.EXECUTE_REDIS_COMMAND) {
        callbacks[e.data.requestId] && callbacks[e.data.requestId](e.data.data)
        delete callbacks[e.data.requestId]
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
  const { scriptSrc, scriptPath, stylesSrc, iframeId, bodyClass } = config
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
          let plugin = {}
          ;(${importPluginScriptInner})(\`${configString}\`);
          import(\`${scriptSrc}\`)
              .then((module) => {
                  plugin = { ...module.default };
                  globalThis.top.postMessage({
                    event: 'loaded',
                    iframeId: \`${iframeId}\`
                  }, '*')
              })
              .catch(() => {
                globalThis.top.postMessage({
                    event: 'error',
                    iframeId: \`${iframeId}\`,
                    error: \`${scriptPath} not found. Check if it has been renamed or deleted and try again.\`
                  }, '*')
              })
        </script>
        <script src="${scriptSrc}" type="module"></script>
      </body>
`
}
