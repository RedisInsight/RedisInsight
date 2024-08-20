import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { QueryActions, QueryTutorials } from 'uiSrc/components/query'

import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { CodeButtonParams } from 'uiSrc/constants'

import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { changeSQActiveRunQueryMode, searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'
import { appContextSearchAndQuery, setSQVerticalScript } from 'uiSrc/slices/app/context'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchRedisearchListAction, redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { SUPPORTED_COMMANDS_LIST } from 'uiSrc/pages/search/components/query/constants'
import { SearchCommand } from 'uiSrc/pages/search/types'
import { TUTORIALS } from './constants'

import Query from '../query'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (
    commandInit: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams
  ) => void
}

const QueryWrapper = (props: Props) => {
  const { onSubmit } = props

  const { id: connectedIndstanceId } = useSelector(connectedInstanceSelector)
  const { script: scriptContext } = useSelector(appContextSearchAndQuery)
  const { activeRunQueryMode } = useSelector(searchAndQuerySelector)
  const { data: indexes = [] } = useSelector(redisearchListSelector)
  const { spec: REDIS_COMMANDS_SPEC, commandsArray } = useSelector(appRedisCommandsSelector)

  const [value, setValue] = useState(scriptContext)

  const input = useRef<HTMLDivElement>(null)
  const scriptRef = useRef('')

  const SUPPORTED_COMMANDS = SUPPORTED_COMMANDS_LIST.map((name) => ({
    ...REDIS_COMMANDS_SPEC[name],
    name
  })) as unknown as SearchCommand[]

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setSQVerticalScript(scriptRef.current))
  }, [])

  useEffect(() => {
    if (!connectedIndstanceId) return

    // fetch indexes
    dispatch(fetchRedisearchListAction())
  }, [connectedIndstanceId])

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
    const val = value.split('\n').join(' ')
    if (!val) return

    onSubmit(val, undefined, { mode: activeRunQueryMode })
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
      eventData: {
        databaseId: instanceId,
        mode: activeRunQueryMode,
        // TODO sanitize user query
        command: getCommandsFromQuery(value, commandsArray) || ''
      }
    })
  }

  const handleChange = (val: string) => {
    setValue(val)
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
          <Query
            indexes={indexes}
            value={value}
            onChange={handleChange}
            supportedCommands={SUPPORTED_COMMANDS}
            commandsSpec={REDIS_COMMANDS_SPEC}
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

export default React.memo(QueryWrapper)
