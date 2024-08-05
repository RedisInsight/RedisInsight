/* eslint-disable no-continue */

import * as monacoEditor from 'monaco-editor'
import { monaco } from 'react-monaco-editor'
import { isString, toNumber } from 'lodash'
import { generateArgsNames, Maybe, Nullable } from 'uiSrc/utils'
import { CommandProvider } from 'uiSrc/constants'
import { ArgName, SearchCommand, SearchCommandTree, TokenType } from './types'

export const buildSuggestion = (arg: SearchCommand, range: monaco.IRange, options: any = {}) => ({
  label: isString(arg) ? arg : arg.token || arg.arguments?.[0].token || arg.name || '',
  insertText: `${arg.token || arg.arguments?.[0].token || arg.name?.toUpperCase() || ''} `,
  insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  range,
  kind: options?.kind || monacoEditor.languages.CompletionItemKind.Function,
  ...options,
})

export const splitQueryByArgs = (query: string, position: number = 0) => {
  const args: [string[], string[]] = [[], []]
  let arg = ''
  let inQuotes = false
  let escapeNextChar = false
  let quoteChar = ''
  const isCursorInArg = false
  let lastArg = ''

  const pushToProperTuple = (isAfterOffset: boolean, arg: string) => {
    lastArg = arg
    isAfterOffset ? args[1].push(arg) : args[0].push(arg)
  }

  const updateLastArgument = (isAfterOffset: boolean, arg: string) => {
    const argsBySide = args[isAfterOffset ? 1 : 0]
    argsBySide[argsBySide.length - 1] = `${argsBySide[argsBySide.length - 1]} ${arg}`
  }

  for (let i = 0; i < query.length; i++) {
    const char = query[i]
    const isAfterOffset = i >= position + (inQuotes ? -1 : 0)

    if (escapeNextChar) {
      arg += char
      escapeNextChar = !quoteChar
    } else if (char === '\\') {
      escapeNextChar = true
    } else if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false
        const argWithChat = arg + char

        if (isCompositeArgument(argWithChat, lastArg)) {
          updateLastArgument(isAfterOffset, argWithChat)
        } else {
          pushToProperTuple(isAfterOffset, argWithChat)
        }

        arg = ''
      } else {
        arg += char
      }
    } else if (char === '"' || char === "'") {
      inQuotes = true
      quoteChar = char
      arg += char
    } else if (char === ' ' || char === '\n') {
      if (arg.length > 0) {
        if (isCompositeArgument(arg, lastArg)) {
          updateLastArgument(isAfterOffset, arg)
        } else {
          pushToProperTuple(isAfterOffset, arg)
        }

        arg = ''
      }
    } else {
      arg += char
    }
  }

  if (arg.length > 0) {
    pushToProperTuple(true, arg)
  }

  return { args, isCursorInArg, prevCursorChar: query[position - 1], nextCursorChar: query[position] }
}

export const getRange = (position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.IRange => ({
  startLineNumber: position.lineNumber,
  endLineNumber: position.lineNumber,
  endColumn: word.endColumn,
  startColumn: word.startColumn,
})

export const findCurrentArgument = (
  args: SearchCommand[],
  prev: string[],
  parent?: SearchCommandTree
): Nullable<{
  isComplete: boolean
  stopArg: Maybe<SearchCommand>,
  isBlocked: boolean,
  append: Maybe<SearchCommand>[],
  parent: Maybe<SearchCommand>
}> => {
  for (let i = prev.length - 1; i >= 0; i--) {
    const arg = prev[i]
    const currentArg = findArgByToken(args, arg)
    const currentWithParent: SearchCommandTree = { ...currentArg, parent }

    if (currentArg?.arguments && currentArg?.type === TokenType.Block) {
      return findCurrentArgument(currentArg.arguments, prev.slice(i), currentWithParent)
    }

    const tokenIndex = args.findIndex((cArg) =>
      (cArg.type === TokenType.OneOf
        ? cArg.arguments?.some((oneOfArg) => oneOfArg.token?.toLowerCase() === arg.toLowerCase())
        : cArg.token?.toLowerCase() === arg.toLowerCase()))
    const token = args[tokenIndex]

    if (token) {
      const pastArgs = prev.slice(i)
      const commandArgs = parent ? args.slice(tokenIndex, args.length) : [token]

      // getArgByRest - here we preparing the list of arguments which can be inserted,
      // this is the main function which creates the list of arguments
      return {
        ...getArgumentSuggestions(pastArgs, commandArgs, parent),
        parent: parent || token
      }
    }
  }

  return null
}

const findStopArgumentInQuery = (
  queryArgs: string[],
  restCommandArgs: Maybe<SearchCommand[]> = [],
): {
  restArguments: SearchCommand[]
  stopArgIndex: number
  isBlocked: boolean
} => {
  let currentCommandArgIndex = 0
  let isBlockedOnCommand = false
  let multipleIndexStart = 0

  const moveToNextCommandArg = () => currentCommandArgIndex++
  const blockCommand = () => { isBlockedOnCommand = true }
  const unBlockCommand = () => { isBlockedOnCommand = false }

  const skipArg = () => {
    moveToNextCommandArg()
    unBlockCommand()
  }

  for (let i = 0; i < queryArgs.length; i++) {
    const arg = queryArgs[i]
    const currentCommandArg = restCommandArgs[currentCommandArgIndex]

    if (currentCommandArg?.type === TokenType.PureToken) {
      skipArg()
      continue
    }

    // if we are on token - that requires one more argument
    if (currentCommandArg?.token === arg.toUpperCase()) {
      blockCommand()
      continue
    }

    if (currentCommandArg?.type === TokenType.Block) {
      // if block is multiple - we duplicate nArgs inner arguments
      let blockArguments = currentCommandArg.arguments

      if (currentCommandArg?.multiple) {
        const nArgs = toNumber(queryArgs[i - 1]) || 0
        blockArguments = Array(nArgs).fill(currentCommandArg.arguments).flat()
      }

      const blockSuggestion = findStopArgumentInQuery(queryArgs.slice(i), blockArguments)
      const stopArg = blockSuggestion.restArguments?.[blockSuggestion.stopArgIndex]
      if (blockSuggestion.isBlocked || stopArg) return blockSuggestion

      i += queryArgs.slice(i).length - 1
      skipArg()
      continue
    }

    if (currentCommandArg?.name === ArgName.NArgs) {
      const numberOfArgs = toNumber(arg)

      if (numberOfArgs === 0) {
        moveToNextCommandArg()
        skipArg()
        continue
      }

      moveToNextCommandArg()
      blockCommand()
      continue
    }

    if (currentCommandArg?.type === TokenType.OneOf && currentCommandArg?.optional) {
      // if oneof is optional then we can switch to another argument
      if (!currentCommandArg?.arguments?.some(({ token }) => token === arg)) {
        moveToNextCommandArg()
      }

      skipArg()
      continue
    }

    if (currentCommandArg?.multiple) {
      const numberOfArgs = toNumber(queryArgs[currentCommandArgIndex]) || 0

      if (!multipleIndexStart) multipleIndexStart = currentCommandArgIndex
      if (i - multipleIndexStart >= numberOfArgs) {
        skipArg()
        continue
      }

      blockCommand()
      continue
    }

    moveToNextCommandArg()

    const nextCommand = restCommandArgs[currentCommandArgIndex + 1]
    isBlockedOnCommand = (!!nextCommand && !nextCommand.optional)
  }

  return {
    restArguments: restCommandArgs,
    stopArgIndex: currentCommandArgIndex,
    isBlocked: isBlockedOnCommand
  }
}

export const getArgumentSuggestions = (
  pastStringArgs: string[],
  pastCommandArgs: SearchCommand[],
  current?: SearchCommandTree
): {
  isComplete: boolean
  stopArg: Maybe<SearchCommand>,
  isBlocked: boolean,
  append: Maybe<SearchCommand>[],
} => {
  const {
    restArguments,
    stopArgIndex,
    isBlocked: isWasBlocked
  } = findStopArgumentInQuery(pastStringArgs, pastCommandArgs)

  // TODO refactor to early return related to where we stopped

  const stopArgument = restArguments[stopArgIndex]
  const restNotFilledArgs = restArguments.slice(stopArgIndex)
  const isBlocked = isWasBlocked || (stopArgument && !(stopArgument.token || stopArgument?.arguments?.length))
  const restParentOptionalSuggestions = !stopArgument || stopArgument?.optional
    ? getRestParentArguments(current?.parent, current?.name, current?.multiple)
      .filter((arg) => arg.optional)
      .filter((arg) => arg.name !== current?.name)
    : []

  const restOptionalSuggestions = fillArgsByType([...restNotFilledArgs, ...restParentOptionalSuggestions])
  const isOneOfArgument = stopArgument?.type === TokenType.OneOf
    || (stopArgument?.type === TokenType.PureToken && current?.parent?.type === TokenType.OneOf)
  const isArgSuggestions = stopArgument && !stopArgument.optional && (stopArgument?.token || isOneOfArgument)

  const suggestions = isArgSuggestions
    // only 1 suggestion since next arg is required
    ? [isOneOfArgument ? stopArgument.arguments : stopArgument].flat()
    : !isBlocked
      ? restOptionalSuggestions
      : []

  const requiredArgsLength = restNotFilledArgs.filter((arg) => !arg.optional).length

  return {
    isComplete: requiredArgsLength === 0 && !isBlocked,
    stopArg: stopArgument,
    isBlocked: isBlocked && !isOneOfArgument,
    append: suggestions,
  }
}

export const getRestParentArguments = (
  parent?: SearchCommandTree,
  currentArgName?: string,
  isIncludeOwn: boolean = true,
  prevArgs: SearchCommand[] = []
): SearchCommand[] => {
  if (!currentArgName) return []

  const currentArgIndex = parent?.arguments?.findIndex((arg) => arg?.name === currentArgName)
  if (!currentArgIndex) return prevArgs

  const currentRestArgs = parent?.arguments?.slice(currentArgIndex + (isIncludeOwn ? 0 : 1)) || []

  if (parent?.parent) return getRestParentArguments(parent.parent, parent.name, true, currentRestArgs)

  return [...currentRestArgs, ...prevArgs]
}

export const fillArgsByType = (args: SearchCommand[]) => {
  const result = []

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i]

    if (currentArg.type === TokenType.OneOf) {
      result.push(...(currentArg?.arguments || []))
    }

    if (currentArg.type === TokenType.Block) {
      result.push(currentArg.arguments?.[0])
    }

    if (currentArg.token) {
      result.push(currentArg)
    }
  }

  return result
}

export const findArgByToken = (list: SearchCommand[], arg: string): Maybe<SearchCommand> =>
  list.find((cArg) =>
    (cArg.type === TokenType.OneOf
      ? cArg.arguments?.some((oneOfArg) => oneOfArg?.token?.toLowerCase() === arg?.toLowerCase())
      : cArg.arguments?.[0]?.token?.toLowerCase() === arg.toLowerCase()))

export const isCompositeArgument = (arg: string, prevArg?: string) => arg === '*' && prevArg === 'LOAD'

export const generateDetail = (command: Maybe<SearchCommand>) => {
  if (!command) return ''

  if (command.arguments) {
    return generateArgsNames(CommandProvider.Main, command.arguments).join(' ')
  }

  if (command.token) {
    if (command.type === TokenType.PureToken) {
      return command.token
    }

    return `${command.token} ${command.name}`
  }

  return ''
}
