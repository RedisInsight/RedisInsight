import React, { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@redislabsdev/redis-ui-styles'
import '@redislabsdev/redis-ui-styles/normalized-styles.css'
import '@redislabsdev/redis-ui-styles/fonts.css'

export function AppRedisUi({ children }: { children?: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
