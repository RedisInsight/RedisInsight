import React, { useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { QueryActions, QueryTutorials } from 'uiSrc/components/query'

import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { CodeButtonParams, defaultMonacoOptions, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { Nullable } from 'uiSrc/utils'
import { changeSQActiveRunQueryMode, searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'
import { appContextSearchAndQuery, setSQVerticalScript } from 'uiSrc/slices/app/context'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { TUTORIALS } from './constants'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (
    commandInit: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams
  ) => void
}

const options = { ...defaultMonacoOptions }

const Query = (props: Props) => {
  const { onSubmit } = props

  const { script: scriptContext } = useSelector(appContextSearchAndQuery)
  const { activeRunQueryMode } = useSelector(searchAndQuerySelector)
  const [value, setValue] = useState(scriptContext)

  const { theme } = useContext(ThemeContext)
  const input = useRef<HTMLDivElement>(null)
  const scriptRef = useRef('')

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setSQVerticalScript(scriptRef.current))
  }, [])

  useEffect(() => {
    scriptRef.current = value
  }, [value])

  const handleChangeQueryRunMode = () => {
    dispatch(changeSQActiveRunQueryMode(
      activeRunQueryMode === RunQueryMode.ASCII
        ? RunQueryMode.Raw
        : RunQueryMode.ASCII
    ))
  }

  const handleSubmit = () => {
    onSubmit(value, undefined, { mode: activeRunQueryMode })
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
      eventData: {
        databaseId: instanceId,
        mode: activeRunQueryMode,
        // TODO sanitize user query
        command: value
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.container}
        onKeyDown={() => {}}
        role="textbox"
        tabIndex={0}
        data-testid="main-input-container-area"
      >
        <div className={styles.input} data-testid="query-input-container" ref={input}>
          <MonacoEditor
            value={value}
            onChange={(val) => setValue(val)}
            language="RediSearch"
            theme={theme === Theme.Dark ? 'dark' : 'light'}
            options={options}
          />
        </div>
        <div className={styles.queryFooter}>
          <QueryTutorials tutorials={TUTORIALS} source="search_tab" />
          <QueryActions
            isLoading={false}
            activeMode={activeRunQueryMode}
            onChangeMode={handleChangeQueryRunMode}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default Query
