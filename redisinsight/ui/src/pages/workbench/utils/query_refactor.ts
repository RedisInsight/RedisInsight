/* eslint-disable no-continue */
import { findIndex, isNumber, toNumber } from 'lodash'
import { ICommandTokenType, IRedisCommand, IRedisCommandTree } from 'uiSrc/constants'
import { Maybe, Nullable } from 'uiSrc/utils'
import { ArgName } from 'uiSrc/pages/workbench/types'
import { isStringsEqual, isTokenEqualsArg } from './helpers'

interface BlockTokensTree {
  queryArgs: string[]
  command?: IRedisCommand
  currentArg?: IRedisCommand
  parent?: BlockTokensTree
}

enum TokenCommandActions {
  SkipArg = 'SkipArg',
  BlockCommand = 'BlockCommand',
  UnBlockCommand = 'UnBlockCommand',
  MoveToNextCommandArg = 'MoveToNextCommandArg',
  Continue = 'Continue'
}

export const findSuggestionsByQueryArgs = (
  commands: IRedisCommand[],
  queryArgs: string[],
) => {
  const firstQueryArg = queryArgs[0]
  const scopeCommand = firstQueryArg
    ? commands.find((command) => isStringsEqual(command.token, firstQueryArg))
    : undefined

  const getLastBlock = (
    args: string[],
    command?: IRedisCommand,
    parent?: any,
  ): BlockTokensTree => {
    for (let i = args.length - 1; i >= 0; i--) {
      const arg = args[i]
      const currentArg = findArgByToken(command?.arguments || [], arg)
      if (currentArg?.type === ICommandTokenType.Block) {
        return getLastBlock(
          args.slice(i),
          currentArg,
          { queryArgs: args.slice(i), command: currentArg, parent }
        )
      }

      if (currentArg?.token) {
        return { currentArg, queryArgs: args.slice(i), command, parent }
      }
    }

    return parent
  }

  const nextArgs = queryArgs.slice(scopeCommand ? 1 : 0)
  const blockToken: BlockTokensTree = { queryArgs: nextArgs, command: scopeCommand }
  const lastFoundBlock = getLastBlock(nextArgs, scopeCommand, blockToken)

  return findStopArgumentWithSuggestions(lastFoundBlock)
}

const findStopArgumentWithSuggestions = (currentBlock: BlockTokensTree) => {
  const blockIndex = findIndex(currentBlock.command?.arguments,
    ({ name }) => name === currentBlock.currentArg?.name)
  const iterateArgs = currentBlock?.command?.arguments?.slice(blockIndex > -1 ? blockIndex : 0) || []
  const {
    restArguments,
    stopArgIndex,
    isBlocked: isWasBlocked,
    parent
  } = getStopArgument(currentBlock.queryArgs, iterateArgs)

  // TODO: from this place need commbine stopArg with block founded

  const prevArg = restArguments[stopArgIndex - 1]
  const stopArgument = restArguments[stopArgIndex]
  const restNotFilledArgs = restArguments.slice(stopArgIndex)

  const isOneOfArgument = stopArgument?.type === ICommandTokenType.OneOf
    || (stopArgument?.type === ICommandTokenType.PureToken && currentBlock?.parent?.command?.type === ICommandTokenType.OneOf)

  if (isWasBlocked) {
    return {
      isComplete: false,
      stopArg: stopArgument,
      isBlocked: !isOneOfArgument,
      append: isOneOfArgument ? [stopArgument.arguments!] : [],
      parent: currentBlock.command
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
      parent: currentBlock.command
    }
  }

  // parent - can be new next block argument, so we need take it
  const lastArgument = stopArgument ?? (currentBlock.command)
  const current = parent ? { ...currentBlock, command: parent } : currentBlock
  const beforeMandatoryOptionalArgs = getAllRestArguments(current, lastArgument)
  const requiredArgsLength = restNotFilledArgs.filter((arg) => !arg.optional).length

  return {
    isComplete: requiredArgsLength === 0,
    stopArg: stopArgument,
    isBlocked: false,
    append: beforeMandatoryOptionalArgs,
  }
}

// TODO: not fully complete (can work a bit different from prev)
const getStopArgument = (
  queryArgs: string[],
  restCommandArgs: Maybe<IRedisCommand[]> = [],
): any => {
  let currentCommandArgIndex = 0
  let argumentsIntered = 0
  let isBlockedOnCommand = true
  let multipleIndexStart = 0
  let multipleCountNumber = 0

  const doActions = (actions: TokenCommandActions[]) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const action of actions) {
      switch (action) {
        case TokenCommandActions.MoveToNextCommandArg: {
          currentCommandArgIndex++
          argumentsIntered++
          break
        }
        case TokenCommandActions.BlockCommand: {
          isBlockedOnCommand = true
          break
        }
        case TokenCommandActions.UnBlockCommand: {
          isBlockedOnCommand = false
          break
        }
        case TokenCommandActions.SkipArg: {
          argumentsIntered -= 1
          currentCommandArgIndex++
          argumentsIntered++
          isBlockedOnCommand = false
          break
        }
        default:
          break
      }
    }
  }

  for (let i = 0; i < queryArgs.length; i++) {
    const arg = queryArgs[i]
    const currentCommandArg = restCommandArgs[currentCommandArgIndex]
    if (currentCommandArg?.type === ICommandTokenType.PureToken) {
      doActions([TokenCommandActions.SkipArg])
      continue
    }

    if (!isBlockedOnCommand && currentCommandArg?.optional) {
      const actions = handleOptionalArgument(currentCommandArg, arg)
      doActions(actions)
      if (actions.includes(TokenCommandActions.Continue)) continue
    }

    if (currentCommandArg?.type === ICommandTokenType.Block) {
      const { actions = [], newIndex, data } = handleBlockArgument(currentCommandArg, queryArgs, i)

      if (data) return data
      i = newIndex || i

      doActions(actions)
      if (actions.includes(TokenCommandActions.Continue)) continue
    }

    // if we are on token - that requires one more argument
    if (isStringsEqual(currentCommandArg?.token, arg)) {
      doActions([TokenCommandActions.BlockCommand])
      continue
    }

    if (currentCommandArg?.name === ArgName.NArgs || currentCommandArg?.name === ArgName.Count) {
      const actions = handleCountArgument(arg)
      doActions(actions)
      if (actions.includes(TokenCommandActions.Continue)) continue
    }

    if (currentCommandArg?.type === ICommandTokenType.OneOf && currentCommandArg?.optional) {
      const actions = handleOptionalOneOfArgument(currentCommandArg, arg)
      doActions(actions)
      if (actions.includes(TokenCommandActions.Continue)) continue
    }

    if (currentCommandArg?.multiple) {
      const {
        actions,
        multipleCountNumber: newMultipleCountNumber,
        multipleIndexStart: newMultipleIndexStart
      } = handleMultipleArgument(multipleCountNumber, multipleIndexStart, queryArgs, i)

      multipleCountNumber = newMultipleCountNumber
      multipleIndexStart = newMultipleIndexStart

      doActions(actions)
      if (actions.includes(TokenCommandActions.Continue)) continue
    }

    doActions([TokenCommandActions.MoveToNextCommandArg])
    isBlockedOnCommand = false
  }

  return {
    restArguments: restCommandArgs,
    stopArgIndex: currentCommandArgIndex,
    argumentsIntered,
    isBlocked: isBlockedOnCommand
  }
}

const handleOptionalArgument = (currentCommandArg: IRedisCommand, arg: string) => {
  const isNotToken = currentCommandArg?.token && !isStringsEqual(currentCommandArg.token, arg)
  const isNotOneOfToken = !currentCommandArg?.token && currentCommandArg?.type === ICommandTokenType.OneOf
    && currentCommandArg?.arguments?.every(({ token }) => !isStringsEqual(token, arg))

  if (isNotToken || isNotOneOfToken) {
    return [TokenCommandActions.MoveToNextCommandArg, TokenCommandActions.SkipArg, TokenCommandActions.Continue]
  }

  return []
}

const handleBlockArgument = (
  currentCommandArg: IRedisCommand,
  queryArgs: string[],
  index: number
) => {
  let blockArguments = currentCommandArg.arguments ? [...currentCommandArg.arguments] : []
  const nArgs = toNumber(queryArgs[index - 1]) || 0

  // if block is multiple - we duplicate nArgs inner arguments
  if (currentCommandArg?.multiple && nArgs) {
    blockArguments = Array(nArgs).fill(currentCommandArg.arguments).flat()
  }

  const currentQueryArg = queryArgs.slice(index)?.[0]
  const isBlockHasToken = isStringsEqual(blockArguments?.[0]?.token, currentQueryArg)

  if (currentCommandArg.token && !isBlockHasToken && currentQueryArg) {
    blockArguments.unshift({
      type: ICommandTokenType.PureToken,
      token: currentQueryArg
    })
  }

  const blockSuggestion = getStopArgument(queryArgs.slice(index), blockArguments)
  const stopArg = blockSuggestion.restArguments?.[blockSuggestion.stopArgIndex]
  const { argumentsIntered } = blockSuggestion

  if (nArgs && currentCommandArg?.multiple && isNumber(argumentsIntered) && argumentsIntered >= nArgs) {
    return {
      actions: [TokenCommandActions.SkipArg, TokenCommandActions.Continue],
      newIndex: index + queryArgs.slice(index).length - 1
    }
  }

  if (blockSuggestion.isBlocked || stopArg) {
    return {
      data: { ...blockSuggestion, parent: currentCommandArg }
    }
  }

  return {
    actions: [TokenCommandActions.SkipArg, TokenCommandActions.Continue],
    newIndex: index + queryArgs.slice(index).length - 1
  }
}

const handleCountArgument = (arg: string) => {
  const numberOfArgs = toNumber(arg)

  return [
    TokenCommandActions.MoveToNextCommandArg,
    numberOfArgs === 0 ? TokenCommandActions.SkipArg : TokenCommandActions.BlockCommand,
    TokenCommandActions.Continue
  ]
}

const handleOptionalOneOfArgument = (currentCommandArg: IRedisCommand, arg: string) => {
  // if oneof is optional then we can switch to another argument
  const actions = []
  if (!currentCommandArg?.arguments?.some(({ token }) => isStringsEqual(token, arg))) {
    actions.push(TokenCommandActions.MoveToNextCommandArg)
  }

  actions.push(TokenCommandActions.SkipArg, TokenCommandActions.Continue)
  return actions
}

const handleMultipleArgument = (
  multipleCountNumber: number,
  multipleIndexStart: number,
  queryArgs: string[],
  index: number
) => {
  let newMultipleCountNumber = multipleCountNumber
  let newMultipleIndexStart = multipleIndexStart

  if (!multipleIndexStart) {
    newMultipleCountNumber = toNumber(queryArgs[index - 1])
    newMultipleIndexStart = index - 1
  }

  if (index - newMultipleIndexStart >= newMultipleCountNumber) {
    return {
      actions: [TokenCommandActions.SkipArg, TokenCommandActions.Continue],
      multipleIndexStart: 0,
      multipleCountNumber: newMultipleCountNumber
    }
  }

  return {
    actions: [TokenCommandActions.BlockCommand, TokenCommandActions.Continue],
    multipleIndexStart: newMultipleIndexStart,
    multipleCountNumber: newMultipleCountNumber
  }
}

export const getRestArguments = (
  current: Maybe<any>,
  stopArgument: Nullable<IRedisCommand>
): IRedisCommandTree[] => {
  const argumentIndexInArg = current?.arguments
    ?.findIndex(({ name }) => name === stopArgument?.name)

  const nextMandatoryIndex = stopArgument && !stopArgument.optional
    ? argumentIndexInArg
    : argumentIndexInArg && argumentIndexInArg > -1 ? current?.arguments
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

  if (nextMandatoryArg?.type === ICommandTokenType.OneOf) {
    beforeMandatoryOptionalArgs.unshift(...(nextMandatoryArg.arguments || []))
  }

  return beforeMandatoryOptionalArgs.map((arg) => ({ ...arg, parent: current }))
}

export const getAllRestArguments = (
  current: any,
  stopArgument: Nullable<IRedisCommand>
) => {
  const appendArgs: Array<IRedisCommand[]> = []
  if (stopArgument) {
    const restArgs = getRestArguments(current.command, stopArgument)
    const currentLvlNextArgs = removeNotSuggestedArgs(
      current.queryArgs,
      restArgs
    )
    appendArgs.push(fillArgsByType(currentLvlNextArgs))
  }

  if (current?.parent) {
    const parentArgs = getAllRestArguments(current.parent, current.parent.command)
    if (parentArgs?.length) {
      appendArgs.push(...parentArgs)
    }
  }

  return appendArgs
}

export const removeNotSuggestedArgs = (args: string[], commandArgs: IRedisCommandTree[]) =>
  commandArgs.filter((arg) => {
    if (arg.token && arg.multiple) return true

    if (arg.type === ICommandTokenType.OneOf) {
      return !args
        .some((queryArg) => arg.arguments
          ?.some((oneOfArg) => isStringsEqual(oneOfArg.token, queryArg)))
    }

    if (arg.type === ICommandTokenType.Block) {
      if (arg.token) return !args.includes(arg.token) || arg.multiple
      return arg.arguments?.[0]?.token && (!args.includes(arg.arguments?.[0]?.token?.toUpperCase()) || arg.multiple)
    }

    return arg.token && !args.includes(arg.token)
  })

export const fillArgsByType = (args: IRedisCommand[], expandBlock = true): IRedisCommandTree[] => {
  const result: IRedisCommandTree[] = []

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i]

    if (expandBlock && currentArg.type === ICommandTokenType.OneOf && !currentArg.token) {
      result.push(...(currentArg?.arguments?.map((arg) => ({ ...arg, parent: currentArg })) || []))
    }

    if (currentArg.token) {
      result.push(currentArg)
      continue
    }

    if (currentArg.type === ICommandTokenType.Block) {
      result.push({
        multiple: currentArg.multiple,
        optional: currentArg.optional,
        parent: currentArg,
        ...(currentArg?.arguments?.[0] as IRedisCommand || {}),
      })
    }
  }

  return result
}

const findArgByToken = (list: IRedisCommand[], arg: string): Maybe<IRedisCommand> =>
  list.find((command) => isTokenEqualsArg(command, arg))
