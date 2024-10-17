/* eslint-disable no-continue */
import { isNumber, toNumber } from 'lodash'
import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'
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
        return getLastBlock(args.slice(i), currentArg, { queryArgs: queryArgs.slice(i), command: currentArg, parent })
      }

      // TODO: check on "FT.CREATE index ON JSON"
      if (currentArg?.type === ICommandTokenType.OneOf && currentArg?.token) {
        const nextArgs = args.slice(i - 1)
        return { currentArg, command, parent: parent.parent ?? command, queryArgs: nextArgs }
      }

      if (currentArg) {
        return { currentArg, command, parent: parent.parent ?? command, queryArgs: args }
      }
    }

    return parent
  }

  const blockToken: BlockTokensTree = { queryArgs: queryArgs.slice(scopeCommand ? 1 : 0), command: scopeCommand }
  const lastFoundBlock = getLastBlock(queryArgs, scopeCommand, blockToken)

  return findStopArgumentWithSuggestions(lastFoundBlock)
}

const findStopArgumentWithSuggestions = (currentBlock: BlockTokensTree) => {
  const {
    restArguments,
    stopArgIndex,
    isBlocked: isWasBlocked,
    parent
  } = getStopArgument(currentBlock.queryArgs, currentBlock.command?.arguments || [])

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

  return null
}

// TODO: not fully complete (can work a bit different from prev)
const getStopArgument = (
  queryArgs: string[],
  restCommandArgs: Maybe<IRedisCommand[]> = [],
): any => {
  let currentCommandArgIndex = 0
  let argumentsIntered = 0
  let isBlockedOnCommand = false
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

const findArgByToken = (list: IRedisCommand[], arg: string): Maybe<IRedisCommand> =>
  list.find((command) => isTokenEqualsArg(command, arg))
