import { hot } from 'react-hot-loader/root'
import React, { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { EuiPage, EuiPageBody } from '@elastic/eui'

import Router from './Router'
import store from './slices/store'
import { Theme } from './constants'
import { themeService } from './services'
import { NavigationMenu, Notifications, Config, ShortcutsFlyout, MonitorConfig } from './components'
import { ThemeProvider } from './contexts/themeContext'
import MainComponent from './components/main/MainComponent'

import themeDark from './styles/themes/dark_theme/_dark_theme.lazy.scss'
import themeLight from './styles/themes/light_theme/_light_theme.lazy.scss'

import './App.scss'

themeService.registerTheme(Theme.Dark, [themeDark])
themeService.registerTheme(Theme.Light, [themeLight])

const App = ({ children }: { children?: ReactElement }) => (
  <Provider store={store}>
    <ThemeProvider>
      <Router>
        <div className="main-container">
          <EuiPage className="main">
            <Config />
            <MonitorConfig />
            <NavigationMenu />
            <EuiPageBody component="main">
              <MainComponent />
            </EuiPageBody>
          </EuiPage>
          <Notifications />
          <ShortcutsFlyout />
        </div>
      </Router>
    </ThemeProvider>
    {children}
  </Provider>
)

export default hot(App)
