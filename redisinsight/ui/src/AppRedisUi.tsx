import React, { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@redislabsdev/redis-ui-styles'
import '@redislabsdev/redis-ui-styles/normalized-styles.css'
import '@redislabsdev/redis-ui-styles/fonts.css'

export function AppRedisUi({ children }: { children?: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
/*
 [vite] error while updating dependencies:
Error: ENOENT: no such file or directory, open 'node_modules/ajv/lib/ajv.js'
    at async open (node:internal/fs/promises:639:25)
    at async Object.readFile (node:internal/fs/promises:1242:14)
    at async extractExportsData (file://node_modules/vite/dist/node/chunks/dep-CjorC8P2.js:51155:24)
    at async file://node_modules/vite/dist/node/chunks/dep-CjorC8P2.js:50903:27
    at async Promise.all (index 61)
    at async prepareEsbuildOptimizerRun (file://node_modules/vite/dist/node/chunks/dep-CjorC8P2.js:50900:3)

 */
