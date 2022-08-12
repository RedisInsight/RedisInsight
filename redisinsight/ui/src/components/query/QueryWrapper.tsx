import React from 'react'
import { useSelector } from 'react-redux'
import { EuiLoadingContent } from '@elastic/eui'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'

import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { getMultiCommands, removeMonacoComments, splitMonacoValuePerLines } from 'uiSrc/utils'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { WorkbenchMode } from 'uiSrc/slices/interfaces/workbench'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import Query from './Query'
import styles from './Query/styles.module.scss'

export interface Props {
  query: string
  setQuery: (script: string) => void
  setQueryEl: Function
  setIsCodeBtnDisabled: (value: boolean) => void
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onSubmit: (value?: string) => void
}
const QueryWrapper = (props: Props) => {
  const { query = '', setQuery, setQueryEl, setIsCodeBtnDisabled, onKeyDown, onSubmit } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    loading: isCommandsLoading,
    commandsArray: REDIS_COMMANDS_ARRAY,
  } = useSelector(appRedisCommandsSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}

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

      const workbenchMode = localStorageService?.get(BrowserStorageItem.workbenchMode)

      return {
        command,
        databaseId: instanceId,
        multiple: multiCommands ? 'Multiple' : 'Single',
        pipeline: batchSize > 1,
        rawMode: workbenchMode === WorkbenchMode.Raw
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
      setQuery={setQuery}
      setQueryEl={setQueryEl}
      setIsCodeBtnDisabled={setIsCodeBtnDisabled}
      onKeyDown={onKeyDown}
      onSubmit={handleSubmit}
    />
  )
}

export default React.memo(QueryWrapper)
