import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { EuiLoadingContent } from '@elastic/eui'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { getMultiCommands, removeMonacoComments, splitMonacoValuePerLines } from 'uiSrc/utils'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import Query from './Query'
import styles from './Query/styles.module.scss'

export interface Props {
  query: string
  activeMode: RunQueryMode
  setQuery: (script: string) => void
  setQueryEl: Function
  setIsCodeBtnDisabled: (value: boolean) => void
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onSubmit: (value?: string) => void
  onQueryChangeMode: () => void
}

interface IState {
  activeMode: RunQueryMode
}

let state: IState = {
  activeMode: RunQueryMode.ASCII,
}

const QueryWrapper = (props: Props) => {
  const {
    query = '',
    activeMode,
    setQuery,
    setQueryEl,
    setIsCodeBtnDisabled,
    onKeyDown,
    onSubmit,
    onQueryChangeMode
  } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    loading: isCommandsLoading,
    commandsArray: REDIS_COMMANDS_ARRAY,
  } = useSelector(appRedisCommandsSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}

  state = {
    activeMode,
  }

  const sendEventSubmitTelemetry = (commandInit = query) => {
    const eventData = (() => {
      const commands = splitMonacoValuePerLines(commandInit)

      const [commandLine, ...rest] = commands.map((command = '') => {
        const matchedCommand = REDIS_COMMANDS_ARRAY.find((commandName) =>
          command.toUpperCase().startsWith(commandName))
        return matchedCommand ?? command.split(' ')?.[0]
      })

      const multiCommands = getMultiCommands(rest).replaceAll('\n', ';')

      const command = removeMonacoComments(decode([commandLine, multiCommands].join(';')).trim())

      return {
        command,
        databaseId: instanceId,
        multiple: multiCommands ? 'Multiple' : 'Single',
        pipeline: batchSize > 1,
        rawMode: state.activeMode === RunQueryMode.Raw
      }
    })()

    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_COMMAND_SUBMITTED,
      eventData
    })
  }

  const handleSubmit = (value?: string) => {
    sendEventSubmitTelemetry(value)
    onSubmit(value)
  }

  const Placeholder = (
    <div className={styles.containerPlaceholder}>
      <div>
        <EuiLoadingContent lines={2} className="fluid" />
      </div>
    </div>
  )
  return isCommandsLoading ? (
    Placeholder
  ) : (
    <Query
      query={query}
      activeMode={activeMode}
      setQuery={setQuery}
      setQueryEl={setQueryEl}
      setIsCodeBtnDisabled={setIsCodeBtnDisabled}
      onKeyDown={onKeyDown}
      onSubmit={handleSubmit}
      onQueryChangeMode={onQueryChangeMode}
    />
  )
}

export default React.memo(QueryWrapper)
