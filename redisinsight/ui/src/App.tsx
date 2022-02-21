import { hot } from 'react-hot-loader/root'
import React, { ReactElement } from 'react'
import { Provider, useSelector } from 'react-redux'
import { EuiPage, EuiPageBody } from '@elastic/eui'

import { appInfoSelector } from 'uiSrc/slices/app/info'
import { PagePlaceholder } from 'uiSrc/components'
import Router from './Router'
import store from './slices/store'
import { Theme } from './constants'
import { themeService } from './services'
import { Config, MonitorConfig, NavigationMenu, Notifications, ShortcutsFlyout } from './components'
import { ThemeProvider } from './contexts/themeContext'
import MainComponent from './components/main/MainComponent'

import themeDark from './styles/themes/dark_theme/_dark_theme.lazy.scss'
import themeLight from './styles/themes/light_theme/_light_theme.lazy.scss'

import './App.scss'
import { BuildType } from "uiSrc/constants/env";

themeService.registerTheme(Theme.Dark, [themeDark])
themeService.registerTheme(Theme.Light, [themeLight])

const AppWrapper = ({ children }: { children?: ReactElement }) => (
  <Provider store={store}>
    <ThemeProvider>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
    {children}
  </Provider>
)
const App = () => {
  const { loading: serverLoading, server } = useSelector(appInfoSelector)
  return (
    <div className="main-container">
      { serverLoading
        ? <PagePlaceholder />
        : (
          <EuiPage className="main">
            <MonitorConfig />
            <NavigationMenu buildType={server?.buildType as BuildType} />
            <EuiPageBody component="main">
              <MainComponent />
            </EuiPageBody>
          </EuiPage>
        )}
      <Notifications />
      <Config />
      <ShortcutsFlyout />
    </div>
  )
}
export default hot(AppWrapper)
