import React, { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { useTheme } from '@redislabsdev/redis-ui-styles'
import '@redislabsdev/redis-ui-styles/normalized-styles.css'
import '@redislabsdev/redis-ui-styles/fonts.css'

export function AppRedisUi({ children }: { children?: ReactNode }) {
  const theme = useTheme()
  // override colors
  theme.components.button.variants = {
    ...theme.components.button.variants,
    primary: {
      ...theme.components.button.variants.primary,
      normal: {
        ...theme.components.button.variants.primary.normal,
        bgColor: '#465282',
      },
    },
    'secondary-ghost': {
      ...theme.components.button.variants['secondary-ghost'],
      normal: {
        ...theme.components.button.variants['secondary-ghost'].normal,
        textColor: '#dfe5ef',
      },
    },
  }
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
