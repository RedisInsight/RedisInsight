import * as monacoEditor from 'monaco-editor'
import { isEmpty, isUndefined, reject } from 'lodash'
import { ICommands } from 'uiSrc/constants'
import { IMonacoCommand } from './monacoInterfaces'
import { Nullable } from './types'
import { getCommandRepeat, isRepeatCountCorrect } from './commands'

const COMMENT_SYMBOLS = '//'
const BLANK_LINE_REGEX = /^\s*\n/gm
const QUOTES = ['\'', '"', '`']
const COMMENT_LINE_REGEX = /^\s+\/\/.*/

const removeCommentsFromLine = (text: string = '', prefix: string = ''): string => {
  const [command, ...rest] = text.split(COMMENT_SYMBOLS)
  const isOddQuotes = QUOTES.some((quote: string) =>
    ((prefix + command).split(quote).length - 1) % 2 !== 0)

  if (isOddQuotes && command && rest.length) {
    return removeCommentsFromLine(rest.join(COMMENT_SYMBOLS), prefix + command + COMMENT_SYMBOLS)
  }

  return prefix + text.replace(/\/\/.*/, '')
}

export const splitMonacoValuePerLines = (command = '') => {
  const linesResult: string[] = []
  const lines = command.split(/\n(?=[^\s])/g)
  lines.forEach((line) => {
    const [commandLine, countRepeat] = getCommandRepeat(line)

    if (!isRepeatCountCorrect(countRepeat)) {
      linesResult.push(line)
      return
    }
    linesResult.push(...Array(countRepeat).fill(commandLine))
  })
  return linesResult
}

export const getMultiCommands = (commands:string[] = []) => reject(commands, isEmpty).join('\n') ?? ''

export const removeMonacoComments = (text: string = '') => text
  .split('\n')
  .filter((line: string) => !COMMENT_LINE_REGEX.test(line))
  .map((line: string) => removeCommentsFromLine(line))
  .join('\n')
  .trim()

export const multilineCommandToOneLine = (text: string = '') => text
  .split(/(\r\n|\n|\r)+\s+/gm)
  .filter((line: string) => !(BLANK_LINE_REGEX.test(line) || isEmpty(line)))
  .join(' ')

export const findCommandEarlier = (
  model: monacoEditor.editor.ITextModel,
  position: monacoEditor.Position,
  commandsSpec: ICommands = {},
  commandsArray: string[] = []
): Nullable<IMonacoCommand> => {
  const { lineNumber } = position
  let commandName = ''
  const notCommandRegEx = /^\s|\/\//

  // find command in the previous lines if current line is argument
  // eslint-disable-next-line for-direction
  for (let previousLineNumber = lineNumber; previousLineNumber > 0; previousLineNumber--) {
    commandName = model.getLineContent(previousLineNumber)?.toUpperCase() ?? ''

    if (!notCommandRegEx.test(commandName)) {
      break
    }
  }

  const matchedCommand = commandsArray.find((command) => commandName?.trim().startsWith(command))

  if (isUndefined(matchedCommand)) {
    return null
  }

  const command:IMonacoCommand = {
    position,
    name: matchedCommand,
    info: commandsSpec[matchedCommand]
  }

  return command
}
