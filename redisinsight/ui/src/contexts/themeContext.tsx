import React from 'react'
import { BrowserStorageItem, THEMES } from '../constants'
import { localStorageService, themeService } from '../services'

interface Props {
  children: React.ReactNode;
}

const THEME_NAMES = THEMES.map(({ value }) => value)

const defaultState = {
  theme: THEME_NAMES[0],
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

    themeService.applyTheme(theme)

    this.state = {
      theme,
    }
  }

  changeTheme = (themeValue: any) => {
    this.setState({ theme: themeValue }, () => {
      themeService.applyTheme(themeValue)
    })
  }

  render() {
    const { children } = this.props
    const { theme }: any = this.state

    return (
      <ThemeContext.Provider
        value={{
          theme,
          changeTheme: this.changeTheme,
        }}
      >
        <div className={`theme_${theme}`}>{children}</div>
      </ThemeContext.Provider>
    )
  }
}

export default ThemeProvider
