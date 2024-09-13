/* eslint-disable no-continue */

import { isNumber, toNumber } from 'lodash'
import { generateArgsNames, Maybe, Nullable } from 'uiSrc/utils'
import { CommandProvider } from 'uiSrc/constants'
import { ArgName, FoundCommandArgument, SearchCommand, SearchCommandTree, TokenType } from '../types'

export const splitQueryByArgs = (query: string, position: number = 0) => {
  const args: [string[], string[]] = [[], []]
  let arg = ''
  let inQuotes = false
  let escapeNextChar = false
  let quoteChar = ''
  let isCursorInQuotes = false
  let lastArg = ''
  let argLeftOffset = 0
  let argRightOffset = 0

  const pushToProperTuple = (isAfterOffset: boolean, arg: string) => {
    lastArg = arg
    isAfterOffset ? args[1].push(arg) : args[0].push(arg)
  }

  const updateLastArgument = (isAfterOffset: boolean, arg: string) => {
    const argsBySide = args[isAfterOffset ? 1 : 0]
    argsBySide[argsBySide.length - 1] = `${argsBySide[argsBySide.length - 1]} ${arg}`
  }

  const updateArgOffsets = (left: number, right: number) => {
    argLeftOffset = left
    argRightOffset = right
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

        if (isAfterOffset && !argLeftOffset) {
          updateArgOffsets(i - arg.length, i + 1)
        }

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
        if (isAfterOffset && !argLeftOffset) {
          updateArgOffsets(i - arg.length, i)
        }

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

    if (i === position - 1) isCursorInQuotes = inQuotes
  }

  if (arg.length > 0) {
    if (!argLeftOffset) updateArgOffsets(query.length - arg.length, query.length)
    pushToProperTuple(true, arg)
  }

  const cursor = {
    isCursorInQuotes,
    prevCursorChar: query[position - 1],
    nextCursorChar: query[position],
    argLeftOffset,
    argRightOffset
  }

  return { args, cursor }
}

export const findCurrentArgument = (
  args: SearchCommand[],
  prev: string[],
  parent?: SearchCommandTree
): Nullable<FoundCommandArgument> => {
  for (let i = prev.length - 1; i >= 0; i--) {
    const arg = prev[i]
    const currentArg = findArgByToken(args, arg)
    const currentWithParent: SearchCommandTree = { ...currentArg, parent }

    if (currentArg?.arguments && currentArg?.type === TokenType.Block) {
      return findCurrentArgument(currentArg.arguments, prev.slice(i), currentWithParent)
    }

    const tokenIndex = args.findIndex((cArg) =>
      cArg.token?.toLowerCase() === arg.toLowerCase())
    const token = args[tokenIndex]

    if (token) {
      const pastArgs = prev.slice(i)
      const commandArgs = parent ? args.slice(tokenIndex, args.length) : [token]

      // getArgByRest - here we preparing the list of arguments which can be inserted,
      // this is the main function which creates the list of arguments
      return {
        ...getArgumentSuggestions({ tokenArgs: pastArgs, levelArgs: prev }, commandArgs, parent),
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
  argumentsIntered?: number
  isBlocked: boolean
} => {
  let currentCommandArgIndex = 0
  let argumentsIntered = 0
  let isBlockedOnCommand = false
  let multipleIndexStart = 0
  let multipleCountNumber = 0

  const moveToNextCommandArg = () => {
    currentCommandArgIndex++
    argumentsIntered++
  }
  const blockCommand = () => { isBlockedOnCommand = true }
  const unBlockCommand = () => { isBlockedOnCommand = false }

  const skipArg = () => {
    argumentsIntered -= 1
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

    if (!isBlockedOnCommand && currentCommandArg.optional) {
      const isNotToken = currentCommandArg?.token && currentCommandArg.token !== arg.toUpperCase()
      const isNotOneOfToken = currentCommandArg?.type === TokenType.OneOf
        && currentCommandArg?.arguments?.every(({ token }) => token !== arg.toUpperCase())

      if (isNotToken || isNotOneOfToken) {
        moveToNextCommandArg()
        skipArg()
        continue
      }
    }

    // if we are on token - that requires one more argument
    if (currentCommandArg?.token === arg.toUpperCase()) {
      blockCommand()
      continue
    }

    if (currentCommandArg?.type === TokenType.Block) {
      let blockArguments = currentCommandArg.arguments
      const nArgs = toNumber(queryArgs[i - 1]) || 0
      // if block is multiple - we duplicate nArgs inner arguments
      if (currentCommandArg?.multiple) {
        blockArguments = Array(nArgs).fill(currentCommandArg.arguments).flat()
      }

      const blockSuggestion = findStopArgumentInQuery(queryArgs.slice(i), blockArguments)
      const stopArg = blockSuggestion.restArguments?.[blockSuggestion.stopArgIndex]
      const { argumentsIntered } = blockSuggestion

      if (isNumber(argumentsIntered) && argumentsIntered >= nArgs) {
        i += queryArgs.slice(i).length - 1
        skipArg()
        continue
      }

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
      if (!multipleIndexStart) {
        multipleCountNumber = toNumber(queryArgs[i - 1])
        multipleIndexStart = i - 1
      }

      if (i - multipleIndexStart >= multipleCountNumber) {
        skipArg()
        multipleIndexStart = 0
        continue
      }

      blockCommand()
      continue
    }

    moveToNextCommandArg()

    isBlockedOnCommand = false
  }

  return {
    restArguments: restCommandArgs,
    stopArgIndex: currentCommandArgIndex,
    argumentsIntered,
    isBlocked: isBlockedOnCommand
  }
}

export const getArgumentSuggestions = (
  { tokenArgs, levelArgs }: {
    tokenArgs: string[],
    levelArgs: string[]
  },
  pastCommandArgs: SearchCommand[],
  current?: SearchCommandTree
): {
  isComplete: boolean
  stopArg: Maybe<SearchCommand>,
  isBlocked: boolean,
  append: Array<SearchCommand[]>,
} => {
  const {
    restArguments,
    stopArgIndex,
    isBlocked: isWasBlocked
  } = findStopArgumentInQuery(tokenArgs, pastCommandArgs)

  const stopArgument = restArguments[stopArgIndex]
  const restNotFilledArgs = restArguments.slice(stopArgIndex)

  const isOneOfArgument = stopArgument?.type === TokenType.OneOf
    || (stopArgument?.type === TokenType.PureToken && current?.parent?.type === TokenType.OneOf)

  if (isWasBlocked) {
    return {
      isComplete: false,
      stopArg: stopArgument,
      isBlocked: !isOneOfArgument,
      append: isOneOfArgument ? [stopArgument.arguments!] : [],
    }
  }

  if (stopArgument && !stopArgument.optional) {
    const isCanAppend = stopArgument?.token || isOneOfArgument
    const append = isCanAppend ? [[isOneOfArgument ? stopArgument.arguments! : stopArgument].flat()] : []

    return {
      isComplete: false,
      stopArg: stopArgument,
      isBlocked: !isCanAppend,
      append,
    }
  }

  // if we finished argument - stopArgument will be undefined, then we get it as token
  const lastArgument = stopArgument ?? restArguments[0]
  const beforeMandatoryOptionalArgs = getAllRestArguments(current, lastArgument, levelArgs, !stopArgument)
  const requiredArgsLength = restNotFilledArgs.filter((arg) => !arg.optional).length

  return {
    isComplete: requiredArgsLength === 0,
    stopArg: stopArgument,
    isBlocked: false,
    append: beforeMandatoryOptionalArgs,
  }
}

export const getRestArguments = (
  current: Maybe<SearchCommandTree>,
  stopArgument: Nullable<SearchCommand>
): SearchCommandTree[] => {
  const argumentIndexInArg = current?.arguments
    ?.findIndex(({ name }) => name === stopArgument?.name)
  const nextMandatoryIndex = argumentIndexInArg && argumentIndexInArg > -1 ? current?.arguments
    ?.findIndex(({ optional }, i) => !optional && i > argumentIndexInArg) : -1

  const beforeMandatoryOptionalArgs = (
    nextMandatoryIndex && nextMandatoryIndex > -1
      ? current?.arguments?.slice(argumentIndexInArg, nextMandatoryIndex)
      : current?.arguments?.filter(({ optional }) => optional)
  ) || []

  const nextMandatoryArg = nextMandatoryIndex && nextMandatoryIndex > -1
    ? current?.arguments?.[nextMandatoryIndex]
    : undefined

  if (nextMandatoryArg?.token) {
    beforeMandatoryOptionalArgs.unshift(nextMandatoryArg)
  }

  return fillArgsByType(beforeMandatoryOptionalArgs)
    .map((arg) => ({
      ...arg,
      parent: current
    }))
}

export const getAllRestArguments = (
  current: Maybe<SearchCommandTree>,
  stopArgument: Nullable<SearchCommand>,
  prevStringArgs: string[] = [],
  skipLevel = false
) => {
  const appendArgs: Array<SearchCommand[]> = []

  const currentLvlNextArgs = removeNotSuggestedArgs(
    prevStringArgs,
    getRestArguments(current, stopArgument)
  )

  if (!skipLevel) {
    appendArgs.push(currentLvlNextArgs)
  }

  if (current?.parent) {
    const parentArgs = getAllRestArguments(current.parent, current, skipLevel ? prevStringArgs : [])
    if (parentArgs?.length) {
      appendArgs.push(...parentArgs)
    }
  }

  return appendArgs
}

export const removeNotSuggestedArgs = (args: string[], commandArgs: SearchCommandTree[]) =>
  commandArgs.filter((arg) => arg.token
    && (arg.multiple || !args.some((queryArg) => queryArg.toUpperCase() === arg.token?.toUpperCase())))

export const fillArgsByType = (args: SearchCommand[], expandBlock = true): SearchCommand[] => {
  const result: SearchCommand[] = []

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i]

    if (expandBlock && currentArg.type === TokenType.OneOf) result.push(...(currentArg?.arguments || []))
    if (currentArg.type === TokenType.Block) {
      result.push({
        multiple: currentArg.multiple,
        optional: currentArg.optional,
        ...(currentArg?.arguments?.[0] as SearchCommand || {}),
      })
    }
    if (currentArg.token) result.push(currentArg)
  }

  return result
}

export const findArgByToken = (list: SearchCommand[], arg: string): Maybe<SearchCommand> =>
  list.find((cArg) =>
    (cArg.type === TokenType.OneOf
      ? cArg.arguments?.some((oneOfArg: SearchCommand) => oneOfArg?.token?.toLowerCase() === arg?.toLowerCase())
      : cArg.arguments?.[0]?.token?.toLowerCase() === arg.toLowerCase()))

export const isCompositeArgument = (arg: string, prevArg?: string) => arg === '*' && prevArg === 'LOAD'

export const generateDetail = (command: Maybe<SearchCommand>) => {
  if (!command) return ''
  if (command.arguments) return generateArgsNames(CommandProvider.Main, command.arguments).join(' ')
  if (command.token) {
    if (command.type === TokenType.PureToken) return command.token
    return `${command.token} ${command.name}`
  }

  return ''
}

export const addOwnTokenToArgs = (token: string, command: SearchCommand) => {
  if (command.arguments) {
    return ({ ...command, arguments: [{ token, type: TokenType.PureToken }, ...command.arguments] })
  }
  return command
}
