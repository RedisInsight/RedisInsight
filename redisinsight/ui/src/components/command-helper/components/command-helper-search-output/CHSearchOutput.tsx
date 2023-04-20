import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiFlexItem, EuiLink, EuiText, EuiFlexGroup, EuiTextColor } from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { generateArgsNames } from 'uiSrc/utils'
import { setSearchedCommand } from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import styles from './styles.module.scss'

export interface Props {
  searchedCommands: string[];
}

const CHSearchOutput = ({ searchedCommands }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()
  const { spec: ALL_REDIS_COMMANDS } = useSelector(appRedisCommandsSelector)

  const handleClickCommand = (e: React.MouseEvent<HTMLAnchorElement>, command: string) => {
    e.preventDefault()
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_COMMAND_OPENED,
      eventData: {
        databaseId: instanceId,
        command
      }
    })
    dispatch(setSearchedCommand(command))
  }

  const renderDescription = (command: string) => {
    const args = ALL_REDIS_COMMANDS[command].arguments || []
    if (args.length) {
      const argString = generateArgsNames(ALL_REDIS_COMMANDS[command]?.provider, args).join(' ')
      return (
        <EuiText
          size="s"
          color="subdued"
          className={styles.description}
          data-testid={`cli-helper-output-args-${command}`}
        >
          {argString}
        </EuiText>
      )
    }
    return (
      <EuiText
        size="s"
        color="subdued"
        className={cx(styles.description, styles.summary)}
        data-testid={`cli-helper-output-summary-${command}`}
      >
        {ALL_REDIS_COMMANDS[command].summary}
      </EuiText>
    )
  }

  return (
    <>
      {searchedCommands.length > 0 && (
        <div style={{ width: '100%' }}>
          {searchedCommands.map((command: string) => (
            <EuiFlexGroup gutterSize="s" key={command} responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiText key={command} size="s">
                  <EuiLink
                    color="text"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      handleClickCommand(e, command)
                    }}
                    className={styles.title}
                    data-testid={`cli-helper-output-title-${command}`}
                  >
                    {command}
                  </EuiLink>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem style={{ flexDirection: 'row', overflow: 'hidden' }}>
                {renderDescription(command)}
              </EuiFlexItem>
            </EuiFlexGroup>
          ))}
        </div>
      )}
      {searchedCommands.length === 0 && (
        <div className={styles.defaultScreen}>
          <EuiTextColor
            color="subdued"
            data-testid="search-cmds-no-results"
          >
            No results found.
          </EuiTextColor>
        </div>
      )}
    </>
  )
}

export default CHSearchOutput
