import { isUndefined } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { getCommandRepeat } from 'uiSrc/utils'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import CliAutocomplete from './CliAutocomplete'

import CliInput from './CliInput'
import { outputSelector } from 'uiSrc/slices/cli/cli-output';

export interface Props {
  command: string;
  wordsTyped: number;
  setInputEl: Function;
  setCommand: (command: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
}

const CliInputWrapper = (props: Props) => {
  const { command = '', wordsTyped, setInputEl, setCommand, onKeyDown } = props
  const { spec: ALL_REDIS_COMMANDS } = useSelector(appRedisCommandsSelector)
  const { db } = useSelector(outputSelector)

  const [commandLine, repeatCommand] = getCommandRepeat(command)
  const [firstCommand, secondCommand] = commandLine.split(' ')
  const firstCommandMatch = firstCommand.toUpperCase()
  const secondCommandMatch = `${firstCommandMatch} ${secondCommand ? secondCommand.toUpperCase() : null}`

  const matchedCmd = ALL_REDIS_COMMANDS[firstCommandMatch] || ALL_REDIS_COMMANDS[secondCommandMatch]
  const commandName = !isUndefined(ALL_REDIS_COMMANDS[secondCommandMatch])
    ? `${firstCommand} ${secondCommand}`
    : firstCommand

  return (
    <>
      <CliInput
        command={command}
        setInputEl={setInputEl}
        setCommand={setCommand}
        onKeyDown={onKeyDown}
        dbIndex={db}
      />
      {matchedCmd && (
        <CliAutocomplete
          commandName={commandName}
          wordsTyped={repeatCommand === 1 ? wordsTyped : wordsTyped - 1}
          {...matchedCmd}
        />
      )}
    </>
  )
}

export default CliInputWrapper
