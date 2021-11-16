import { isUndefined } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import CliAutocomplete from './CliAutocomplete'

import CliInput from './CliInput'

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
  const [firstCommand, secondCommand] = command.split(' ')
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
      />
      {matchedCmd && (
        <CliAutocomplete commandName={commandName} wordsTyped={wordsTyped} {...matchedCmd} />
      )}
    </>
  )
}

export default CliInputWrapper
