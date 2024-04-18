import React, { useEffect } from 'react'

const MonacoEnvironmentInitializer = () => {
  useEffect(() => {
    function getWorkerUrl(moduleId, label) {
      if (['json', 'typescript', 'javascript', 'yaml'].includes(label)) {
        return `${label}.worker.js`
      }

      return 'editor.worker.js'
    }
    window.MonacoEnvironment = {
      getWorkerUrl: (moduleId, label) => {
        let workerUrl = getWorkerUrl(moduleId, label)
        const proxyPath = window.__RIPROXYPATH__ || ''
        if (proxyPath) {
          workerUrl = `${proxyPath}/${workerUrl}`
        }
        return workerUrl
      }
    }
  }, [])

  return <></>
}

export default MonacoEnvironmentInitializer
