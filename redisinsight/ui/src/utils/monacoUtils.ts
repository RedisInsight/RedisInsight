import * as monacoEditor from 'monaco-editor'
import { isEmpty, isUndefined, reject } from 'lodash'
import { ICommands } from 'uiSrc/constants'
import { IMonacoCommand, IMonacoQuery } from './monacoInterfaces'
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

  // find command and args in the previous lines if current line is argument
  // eslint-disable-next-line for-direction
  for (let previousLineNumber = lineNumber; previousLineNumber > 0; previousLineNumber--) {
    commandName = model.getLineContent(previousLineNumber) ?? ''
    const lineBeforePosition = previousLineNumber === lineNumber
      ? commandName.slice(0, position.column - 1)
      : commandName
    fullQuery = lineBeforePosition + fullQuery

    if (!notCommandRegEx.test(commandName)) {
      break
    }
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

    const lineAfterPosition = nextLineNumber === lineNumber
      ? lineContent.slice(position.column - 1, model.getLineLength(lineNumber))
      : lineContent

    fullQuery += lineAfterPosition
  }

  const args = fullQuery
    .replace(matchedCommand, '')
    .match(/(?:[^\s"']+|['"][^'"]*["'])+/g)

  return {
    position,
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
  shortcut.innerHTML = shortcutText

  widget.append(title, shortcut)
  widget.classList.add('monaco-widget')

  return widget
}
