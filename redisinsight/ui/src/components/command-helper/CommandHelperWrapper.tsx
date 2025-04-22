import { EuiBadge, EuiText } from '@elastic/eui'
import React, { ReactElement, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { CommandGroup, ICommand, ICommandArgGenerated } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  generateArgs,
  generateArgsNames,
  getComplexityShortNotation,
  removeDeprecatedModuleCommands,
  checkDeprecatedModuleCommand,
} from 'uiSrc/utils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/Flex'
import CommandHelper from './CommandHelper'
import CommandHelperHeader from './CommandHelperHeader'

import styles from './CommandHelper/styles.module.scss'

const CommandHelperWrapper = () => {
  const {
    matchedCommand = '',
    searchedCommand = '',
    isSearching,
    isEnteringCommand,
    searchingCommand,
    searchingCommandFilter,
  } = useSelector(cliSettingsSelector)
  const { spec: ALL_REDIS_COMMANDS, commandsArray } = useSelector(
    appRedisCommandsSelector,
  )
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const lastMatchedCommand =
    isEnteringCommand &&
    matchedCommand &&
    !checkDeprecatedModuleCommand(matchedCommand)
      ? matchedCommand
      : searchedCommand

  const KEYS_OF_COMMANDS = useMemo(
    () => removeDeprecatedModuleCommands(commandsArray),
    [commandsArray],
  )
  let searchedCommands: string[] = []

  useEffect(() => {
    if (!isSearching && isEnteringCommand && matchedCommand) {
      sendEventTelemetry({
        event: TelemetryEvent.COMMAND_HELPER_INFO_DISPLAYED_FOR_CLI_INPUT,
        eventData: {
          databaseId: instanceId,
          command: matchedCommand,
        },
      })
    }
  }, [isSearching, isEnteringCommand, matchedCommand])

  const {
    arguments: args = [],
    summary = '',
    group = CommandGroup.Generic,
    complexity = '',
    since = '',
    provider,
  }: ICommand = ALL_REDIS_COMMANDS[lastMatchedCommand.toUpperCase()] ?? {}

  if (isSearching) {
    searchedCommands = KEYS_OF_COMMANDS.filter((command) => {
      const isSuitableForFilter = searchingCommandFilter
        ? ALL_REDIS_COMMANDS[command].group === searchingCommandFilter
        : true
      return (
        isSuitableForFilter &&
        command.toLowerCase().indexOf(searchingCommand.toLowerCase()) > -1
      )
    })
  }

  const generatedArgs = generateArgs(provider, args)
  const complexityShort = getComplexityShortNotation(complexity)
  const argString = [
    lastMatchedCommand.toUpperCase(),
    ...generateArgsNames(provider, args),
  ].join(' ')

  const generateArgData = (
    arg: ICommandArgGenerated,
    i: number,
  ): ReactElement => {
    const type = arg.multiple
      ? 'Multiple'
      : arg.optional
        ? 'Optional'
        : 'Required'
    return (
      <Row justify="between" align="center" className={styles.arg} key={i}>
        <FlexItem>
          <EuiBadge className={styles.badge}>
            <EuiText
              style={{ color: 'white' }}
              className="text-capitalize"
              size="xs"
            >
              {type}
            </EuiText>
          </EuiBadge>
        </FlexItem>
        <FlexItem grow>{arg.generatedName}</FlexItem>
      </Row>
    )
  }

  return (
    <div className={styles.commandHelperWrapper} data-testid="command-helper">
      <CommandHelperHeader />
      <CommandHelper
        commandLine={lastMatchedCommand}
        searchedCommands={searchedCommands}
        isSearching={isSearching}
        argString={argString}
        summary={summary}
        group={group}
        since={since}
        complexity={complexity}
        complexityShort={complexityShort}
        argList={generatedArgs.map((obj, i) => generateArgData(obj, i))}
      />
    </div>
  )
}

export default React.memo(CommandHelperWrapper)
