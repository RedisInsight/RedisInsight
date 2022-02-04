import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiFlexItem, EuiIcon, EuiLoadingContent, EuiTextColor } from '@elastic/eui'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { getBaseApiUrl, Nullable } from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { CommandExecutionResult, IPluginVisualization } from 'uiSrc/slices/interfaces'
import { PluginEvents } from 'uiSrc/plugins/pluginEvents'
import { prepareIframeHtml } from 'uiSrc/plugins/pluginImport'
import {
  appPluginsSelector,
  getPluginStateAction,
  sendPluginCommandAction,
  setPluginStateAction
} from 'uiSrc/slices/app/plugins'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'

import styles from './styles.module.scss'

export interface Props {
  result: CommandExecutionResult[]
  query: any
  id: string
  setSummaryText: (text: string) => void
  commandId: string
}

enum StylesNamePostfix {
  Dark = '/dark_theme.css',
  Light = '/light_theme.css',
  Global = '/global_styles.css'
}

enum ActionTypes {
  Resolve = 'resolve',
  Reject = 'reject'
}

const baseUrl = getBaseApiUrl()

const QueryCardCliPlugin = (props: Props) => {
  const { query, id, result, setSummaryText, commandId } = props
  const { visualizations = [], staticPath } = useSelector(appPluginsSelector)
  const { modules = [] } = useSelector(connectedInstanceSelector)
  const serverInfo = useSelector(appServerInfoSelector)

  const [currentView, setCurrentView] = useState<Nullable<any>>(null)
  const [currentPlugin, setCurrentPlugin] = useState<Nullable<string>>(null)
  const [isPluginLoaded, setIsPluginLoaded] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const pluginIframeRef = useRef<Nullable<HTMLIFrameElement>>(null)
  const prevPluginHeightRef = useRef<string>('0')
  const generatedIframeNameRef = useRef<string>('')
  const { theme } = useContext(ThemeContext)

  const dispatch = useDispatch()

  const sendMessageToPlugin = (data = {}) => {
    const event: any = document.createEvent('Event')
    event.initEvent('message', false, false)
    event.data = data
    event.origin = '*'
    pluginIframeRef?.current?.contentWindow?.dispatchEvent(event)
  }

  const executeCommand = () => {
    sendMessageToPlugin({
      event: 'executeCommand',
      method: currentView.activationMethod,
      data: { command: query, data: result }
    })
  }

  const sendRedisCommand = ({ command = '', requestId = '' }: { command: string, requestId: string }) => {
    const commonOptions = {
      event: PluginEvents.executeRedisCommand,
      requestId,
    }
    dispatch(
      sendPluginCommandAction({
        command,
        onSuccessAction: (response) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: response.result
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error
          })
        }
      })
    )
  }

  const getPluginState = ({ requestId }: { requestId: string }) => {
    const commonOptions = {
      event: PluginEvents.getState,
      requestId,
    }
    dispatch(
      getPluginStateAction({
        visualizationId: id,
        commandId,
        onSuccessAction: (response) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: response?.state ?? null
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error
          })
        }
      })
    )
  }

  const setPluginState = ({ requestId, state }: { requestId: string, state: any }) => {
    const commonOptions = {
      event: PluginEvents.setState,
      requestId,
    }
    dispatch(
      setPluginStateAction({
        visualizationId: id,
        commandId,
        pluginState: state,
        onSuccessAction: () => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: state
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error
          })
        }
      })
    )
  }

  useEffect(() => {
    if (currentView === null) return
    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.heightChanged, (height: string) => {
      if (pluginIframeRef?.current) {
        pluginIframeRef.current.height = height || prevPluginHeightRef.current
        prevPluginHeightRef.current = height
      }
    })

    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.loaded, () => {
      setIsPluginLoaded(true)
      setError('')
      executeCommand()
    })

    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.error, (error: string) => {
      setIsPluginLoaded(true)
      setError(error)
    })

    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.setHeaderText, (text: string) => {
      setSummaryText(text)
    })

    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.executeRedisCommand, sendRedisCommand)
    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.getState, getPluginState)
    pluginApi.onEvent(generatedIframeNameRef.current, PluginEvents.setState, setPluginState)
  }, [currentView])

  const renderPluginIframe = (config: any) => {
    const html = prepareIframeHtml({
      ...config,
      bodyClass: theme === Theme.Dark ? 'theme_DARK' : 'theme_LIGHT',
      modules
    })
    // @ts-ignore
    pluginIframeRef.current.srcdoc = html
  }

  const getGlobalStylesSrc = (): string =>
    `${baseUrl}${staticPath}${StylesNamePostfix.Global}`

  const getThemeSrc = (): string =>
    `${baseUrl}${staticPath}${theme === Theme.Dark ? StylesNamePostfix.Dark : StylesNamePostfix.Light}`

  const generateStylesSrc = (styles: string): string[] => {
    const themeSrc = getThemeSrc()
    const globalSrc = getGlobalStylesSrc()

    return [globalSrc, themeSrc, `${baseUrl}${styles}`]
  }

  useEffect(() => {
    const view = visualizations.find((visualization: IPluginVisualization) => visualization.uniqId === id)
    if (view) {
      generatedIframeNameRef.current = `${view.plugin.name}-${Date.now()}`
      setCurrentView(view)

      const { plugin } = view
      if (plugin?.name !== currentPlugin) {
        renderPluginIframe({
          baseUrl: `${baseUrl}${plugin.baseUrl}`,
          scriptPath: plugin.scriptSrc,
          scriptSrc: `${baseUrl}${plugin.scriptSrc}`,
          stylesSrc: generateStylesSrc(plugin.stylesSrc),
          iframeId: generatedIframeNameRef.current,
          appVersion: serverInfo?.appVersion,
        })
        setCurrentPlugin(plugin?.name || null)
        return
      }
      executeCommand()
    }
  }, [result])

  return (
    <div className={cx('queryResultsContainer', 'pluginStyles', styles.pluginWrapperResult)}>
      <div data-testid="query-plugin-result">
        <iframe
          seamless
          className={cx('pluginIframe', styles.pluginIframe, { [styles.hidden]: !currentPlugin || !isPluginLoaded || !!error })}
          title={id}
          ref={pluginIframeRef}
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          data-testid="pluginIframe"
        />
        {!!error && (
          <div className={styles.container}>
            <EuiFlexItem className="query-card-output-response-fail">
              <span data-testid="query-card-no-module-output">
                <span className={styles.alertIconWrapper}>
                  <EuiIcon type="alert" color="danger" style={{ display: 'inline', marginRight: 10 }} />
                </span>
                <EuiTextColor color="danger">{error}</EuiTextColor>
              </span>
            </EuiFlexItem>
          </div>
        )}
        {!isPluginLoaded && (
          <div>
            <EuiLoadingContent lines={5} />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(QueryCardCliPlugin)
