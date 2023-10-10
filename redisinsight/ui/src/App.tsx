import { hot } from 'react-hot-loader/root'
import React, { ReactElement } from 'react'
import { Provider, useSelector } from 'react-redux'
import { EuiPage, EuiPageBody } from '@elastic/eui'

import { store } from 'uiSrc/slices/store'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { PagePlaceholder } from 'uiSrc/components'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'
import Router from './Router'
import { Theme } from './constants'
import { themeService } from './services'
import { Config, GlobalSubscriptions, NavigationMenu, Notifications, ShortcutsFlyout } from './components'
import { ThemeProvider } from './contexts/themeContext'
import MainComponent from './components/main/MainComponent'
import ThemeComponent from './components/theme/ThemeComponent'
import GlobalDialogs from './components/global-dialogs'
import GlobalActionBar from './components/global-action-bar'

import themeDark from './styles/themes/dark_theme/_dark_theme.lazy.scss'
import themeLight from './styles/themes/light_theme/_light_theme.lazy.scss'

import './App.scss'

themeService.registerTheme(Theme.Dark, [themeDark])
themeService.registerTheme(Theme.Light, [themeLight])

const AppWrapper = ({ children }: { children?: ReactElement[] }) => (
  <Provider store={store}>
    <ThemeProvider>
      <Router>
        <App>
          {children}
        </App>
      </Router>
    </ThemeProvider>
  </Provider>
)
const App = ({ children }: { children?: ReactElement[] }) => {
  const { loading: serverLoading } = useSelector(appInfoSelector)
  return (
    <div className="main-container">
      <ThemeComponent />
      { serverLoading
        ? <PagePlaceholder />
        : (
          <EuiPage className="main">
            <GlobalActionBar />
            <GlobalDialogs />
            <GlobalSubscriptions />
            <NavigationMenu />
            <EuiPageBody component="main">
              <MainComponent />
            </EuiPageBody>
          </EuiPage>
        )}
      <Notifications />
      <Config />
      <ShortcutsFlyout />
      <MonacoLanguages />
      {children}
    </div>
  )
}
export default hot(AppWrapper)
