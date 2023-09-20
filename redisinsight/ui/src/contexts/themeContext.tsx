import React from 'react'
import { BrowserStorageItem, Theme, THEMES, THEME_MATCH_MEDIA_DARK } from '../constants'
import { localStorageService, themeService } from '../services'

interface Props {
  children: React.ReactNode;
}

const THEME_NAMES = THEMES.map(({ value }) => value)

export const defaultState = {
  theme: THEME_NAMES[0],
  usingSystemTheme: localStorageService.get(BrowserStorageItem.themeSystem) === Theme.System,
  changeTheme: (themeValue: any) => {
    themeService.applyTheme(themeValue)
  },
}

export const ThemeContext = React.createContext(defaultState)

export class ThemeProvider extends React.Component<Props> {
  constructor(props: any) {
    super(props)

    const storedThemeValue = localStorageService.get(BrowserStorageItem.theme)
    const usingSystemTheme = localStorageService.get(BrowserStorageItem.themeSystem) === Theme.System
    const theme = !storedThemeValue || !THEME_NAMES.includes(storedThemeValue)
      ? defaultState.theme
      : storedThemeValue

    themeService.applyTheme(theme)

    this.state = {
      theme,
      usingSystemTheme,
    }
  }

  changeTheme = (themeValue: any) => {
    let actualTheme = themeValue
    if (themeValue === Theme.System) {
      localStorageService.set(BrowserStorageItem.themeSystem, Theme.System)
      if (window.matchMedia && window.matchMedia(THEME_MATCH_MEDIA_DARK).matches) {
        actualTheme = Theme.Dark
      } else {
        actualTheme = Theme.Light
      }
    } else {
      localStorageService.remove(BrowserStorageItem.themeSystem)
    }

    this.setState({ theme: actualTheme, usingSystemTheme: themeValue === Theme.System }, () => {
      themeService.applyTheme(actualTheme)
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
        <div className={`theme_${theme}`}>{children}</div>
      </ThemeContext.Provider>
    )
  }
}

export default ThemeProvider
