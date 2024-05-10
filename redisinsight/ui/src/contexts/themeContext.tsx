import React from 'react'
import { BrowserStorageItem, Theme, THEMES, THEME_MATCH_MEDIA_DARK } from '../constants'
import { localStorageService, themeService } from '../services'

interface Props {
  children: React.ReactNode;
}

const THEME_NAMES = THEMES.map(({ value }) => value)

export const defaultState = {
  theme: THEME_NAMES[1], // dark theme by default
  usingSystemTheme: localStorageService.get(BrowserStorageItem.theme) === Theme.System,
  changeTheme: (themeValue: any) => {
    themeService.applyTheme(themeValue)
  },
}

export const ThemeContext = React.createContext(defaultState)

export class ThemeProvider extends React.Component<Props> {
  constructor(props: any) {
    super(props)

    const storedThemeValue = localStorageService.get(BrowserStorageItem.theme)
    const theme = !storedThemeValue || !THEME_NAMES.includes(storedThemeValue)
      ? defaultState.theme
      : storedThemeValue
    const usingSystemTheme = theme === Theme.System

    themeService.applyTheme(theme)

    this.state = {
      theme: theme === Theme.System ? this.getSystemTheme() : theme,
      usingSystemTheme,
    }
  }

  getSystemTheme = () => (window.matchMedia && window.matchMedia(THEME_MATCH_MEDIA_DARK).matches ? Theme.Dark : Theme.Light)

  changeTheme = (themeValue: any) => {
    let actualTheme = themeValue
    if (themeValue === Theme.System) {
      actualTheme = this.getSystemTheme()
    }
    window.app?.ipc?.invoke?.('theme:change', themeValue)

    this.setState({ theme: actualTheme, usingSystemTheme: themeValue === Theme.System }, () => {
      themeService.applyTheme(themeValue)
    })
  }

  render() {
    const { children } = this.props
    const { theme, usingSystemTheme }: any = this.state

    return (
      <ThemeContext.Provider
        value={{
          theme,
          usingSystemTheme,
          changeTheme: this.changeTheme,
        }}
      >
        {children}
      </ThemeContext.Provider>
    )
  }
}

export default ThemeProvider
