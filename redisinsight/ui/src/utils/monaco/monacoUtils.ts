import * as monacoEditor from 'monaco-editor'
import { first, isEmpty, isUndefined, reject, without } from 'lodash'
import { decode } from 'html-entities'
import { ICommands } from 'uiSrc/constants'
import { IMonacoCommand, IMonacoQuery } from 'uiSrc/utils'
import { Nullable } from '../types'
import { getCommandRepeat, isRepeatCountCorrect } from '../commands'

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
  const lines = getMonacoLines(command)
  // remove execute params
  if (isParamsLine(first(lines))) {
    lines.splice(0, 1, removeParams(first(lines)))
  }

  lines.forEach((line) => {
    const [commandLine, countRepeat] = getCommandRepeat(line || '')

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

export const getCommandsForExecution = (query = '') => without(
  splitMonacoValuePerLines(query).map((command) => removeMonacoComments(decode(command).trim())),
  ''
)

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

export const findCompleteQuery = (
  model: monacoEditor.editor.ITextModel,
  position: monacoEditor.Position,
  commandsSpec: ICommands = {},
  commandsArray: string[] = []
): Nullable<IMonacoQuery> => {
  const { lineNumber } = position
  let commandName = ''
  let fullQuery = ''
  const notCommandRegEx = /^\s|\/\//
  const commandPosition = {
    startLine: 0,
    endLine: 0
  }

  // find command and args in the previous lines if current line is argument
  // eslint-disable-next-line for-direction
  for (let previousLineNumber = lineNumber; previousLineNumber > 0; previousLineNumber--) {
    commandName = model.getLineContent(previousLineNumber) ?? ''
    const lineBeforePosition = previousLineNumber === lineNumber
      ? commandName.slice(0, position.column - 1)
      : commandName
    fullQuery = lineBeforePosition + fullQuery
    commandPosition.startLine = previousLineNumber

    if (!notCommandRegEx.test(commandName)) {
      break
    }

    fullQuery = `\n${fullQuery}`
  }

  const matchedCommand = commandsArray
    .find((command) => commandName?.trim().toUpperCase().startsWith(command.toUpperCase()))

  if (isUndefined(matchedCommand)) {
    return null
  }

  const commandCursorPosition = fullQuery.length
  // find args in the next lines
  const linesCount = model.getLineCount()
  for (let nextLineNumber = lineNumber; nextLineNumber <= linesCount; nextLineNumber++) {
    const lineContent = model.getLineContent(nextLineNumber) ?? ''

    if (nextLineNumber !== lineNumber && !notCommandRegEx.test(lineContent)) {
      break
    }

    commandPosition.endLine = nextLineNumber
    const lineAfterPosition = nextLineNumber === lineNumber
      ? lineContent.slice(position.column - 1, model.getLineLength(lineNumber))
      : lineContent

    if (nextLineNumber !== lineNumber) {
      fullQuery += '\n'
    }

    fullQuery += lineAfterPosition
  }

  const args = fullQuery
    .replace(matchedCommand, '')
    .match(/(?:[^\s"']+|["][^"]*["]|['][^']*['])+/g)

  return {
    position,
    commandPosition,
    commandCursorPosition,
    fullQuery,
    args,
    name: matchedCommand,
    info: commandsSpec[matchedCommand]
  } as IMonacoQuery
}

export const findArgIndexByCursor = (
  args: string[] = [],
  fullQuery: string,
  cursorPosition: number
): Nullable<number> => {
  let argIndex = null
  for (let i = 0; i < args.length; i++) {
    const part = args[i]
    const searchIndex = fullQuery?.indexOf(part) || 0
    if (searchIndex < cursorPosition && searchIndex + part.length > cursorPosition) {
      argIndex = i
      break
    }
  }
  return argIndex
}

export const createSyntaxWidget = (text: string, shortcutText: string) => {
  const widget = document.createElement('div')
  const title = document.createElement('span')
  title.classList.add('monaco-widget__title')
  title.innerHTML = text

  const shortcut = document.createElement('span')
  shortcut.classList.add('monaco-widget__shortcut')
  widget.setAttribute('data-testid', 'monaco-widget')
  shortcut.innerHTML = shortcutText

  widget.append(title, shortcut)
  widget.classList.add('monaco-widget')

  return widget
}

export const isParamsLine = (commandInit: string = '') => {
  const command = commandInit.trim()
  return command.startsWith('[') && (command.indexOf(']') !== -1)
}

const removeParams = (commandInit: string = '') => {
  const command = commandInit.trim()
  const paramsLastIndex = command.indexOf(']')
  return command.substring(paramsLastIndex + 1).trim()
}

export const getMonacoLines = (command: string = '') =>
  command.split(/\n(?=[^\s])/g)
