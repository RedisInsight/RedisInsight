/* eslint-disable no-continue */

import { isNumber, toNumber } from 'lodash'
import { generateArgsNames, Maybe, Nullable } from 'uiSrc/utils'
import { CommandProvider } from 'uiSrc/constants'
import { COMPOSITE_ARGS } from 'uiSrc/pages/search/components/query/constants'
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
    prevCursorChar: query[position - 1]?.trim() || '',
    nextCursorChar: query[position]?.trim() || '',
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
  parent?: SearchCommand
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

    if (!isBlockedOnCommand && currentCommandArg?.optional) {
      const isNotToken = currentCommandArg?.token && currentCommandArg.token !== arg.toUpperCase()
      const isNotOneOfToken = !currentCommandArg?.token && currentCommandArg?.type === TokenType.OneOf
        && currentCommandArg?.arguments?.every(({ token }) => token !== arg.toUpperCase())

      if (isNotToken || isNotOneOfToken) {
        moveToNextCommandArg()
        skipArg()
        continue
      }
    }

    if (currentCommandArg?.type === TokenType.Block) {
      let blockArguments = currentCommandArg.arguments ? [...currentCommandArg.arguments] : []
      const nArgs = toNumber(queryArgs[i - 1]) || 0

      // if block is multiple - we duplicate nArgs inner arguments
      if (currentCommandArg?.multiple && nArgs) {
        blockArguments = Array(nArgs).fill(currentCommandArg.arguments).flat()
      }

      const currentQueryArg = queryArgs.slice(i)?.[0]?.toUpperCase()
      const isBlockHasToken = blockArguments?.[0]?.token === currentQueryArg

      if (currentCommandArg.token && !isBlockHasToken && currentQueryArg) {
        blockArguments.unshift({
          type: TokenType.PureToken,
          token: currentQueryArg
        })
      }

      const blockSuggestion = findStopArgumentInQuery(queryArgs.slice(i), blockArguments)
      const stopArg = blockSuggestion.restArguments?.[blockSuggestion.stopArgIndex]
      const { argumentsIntered } = blockSuggestion

      if (nArgs && currentCommandArg?.multiple && isNumber(argumentsIntered) && argumentsIntered >= nArgs) {
        i += queryArgs.slice(i).length - 1
        skipArg()
        continue
      }

      if (blockSuggestion.isBlocked || stopArg) {
        return {
          ...blockSuggestion,
          parent: currentCommandArg
        }
      }

      i += queryArgs.slice(i).length - 1
      skipArg()
      continue
    }

    // if we are on token - that requires one more argument
    if (currentCommandArg?.token === arg.toUpperCase()) {
      blockCommand()
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
    isBlocked: isWasBlocked,
    parent
  } = findStopArgumentInQuery(tokenArgs, pastCommandArgs)

  const prevArg = restArguments[stopArgIndex - 1]
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

  const isPrevArgWasMandatory = prevArg && !prevArg.optional
  if (isPrevArgWasMandatory && stopArgument && !stopArgument.optional) {
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
  const isBlockHasParent = current?.arguments?.some(({ name }) => parent?.name && name === parent?.name)
  const foundParent = isBlockHasParent ? { ...parent, parent: current } : (parent || current)

  const isBlockComplete = !stopArgument && current?.name === lastArgument?.name
  const beforeMandatoryOptionalArgs = getAllRestArguments(foundParent, lastArgument, levelArgs, isBlockComplete)
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
  const prevMandatory = current?.arguments?.slice(0, argumentIndexInArg).reverse()
    .find(({ optional }) => !optional)
  const prevMandatoryIndex = current?.arguments?.findIndex(({ name }) => name === prevMandatory?.name)

  const beforeMandatoryOptionalArgs = (
    nextMandatoryIndex && nextMandatoryIndex > -1
      ? current?.arguments?.slice(prevMandatoryIndex, nextMandatoryIndex)
      : current?.arguments?.slice((prevMandatoryIndex || 0) + 1)
  ) || []

  const nextMandatoryArg = nextMandatoryIndex && nextMandatoryIndex > -1
    ? current?.arguments?.[nextMandatoryIndex]
    : undefined

  if (nextMandatoryArg?.token) {
    beforeMandatoryOptionalArgs.unshift(nextMandatoryArg)
  }

  if (nextMandatoryArg?.type === TokenType.OneOf) {
    beforeMandatoryOptionalArgs.unshift(...(nextMandatoryArg.arguments || []))
  }

  return beforeMandatoryOptionalArgs.map((arg) => ({ ...arg, parent: current }))
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
    appendArgs.push(fillArgsByType(currentLvlNextArgs))
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
  commandArgs.filter((arg) => {
    if (arg.token && arg.multiple) return true

    if (arg.type === TokenType.OneOf) {
      return !args
        .some((queryArg) => arg.arguments
          ?.some((oneOfArg) => oneOfArg.token?.toUpperCase() === queryArg.toUpperCase()))
    }

    if (arg.type === TokenType.Block) {
      return arg.arguments?.[0]?.token && !args.includes(arg.arguments?.[0]?.token?.toUpperCase())
    }

    return arg.token && !args.includes(arg.token)
  })

export const fillArgsByType = (args: SearchCommand[], expandBlock = true): SearchCommandTree[] => {
  const result: SearchCommandTree[] = []

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i]

    if (expandBlock && currentArg.type === TokenType.OneOf && !currentArg.token) {
      result.push(...(currentArg?.arguments?.map((arg) => ({ ...arg, parent: currentArg })) || []))
    }

    if (currentArg.type === TokenType.Block) {
      result.push({
        multiple: currentArg.multiple,
        optional: currentArg.optional,
        parent: currentArg,
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

export const isCompositeArgument = (arg: string, prevArg?: string) =>
  COMPOSITE_ARGS.includes([prevArg?.toUpperCase(), arg?.toUpperCase()].join(' '))

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
