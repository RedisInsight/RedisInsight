/* eslint-disable no-continue */
import { findLastIndex, isNumber, isUndefined, toNumber } from 'lodash'
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

export const findSuggestionsByQueryArgs = (
  commands: IRedisCommand[],
  queryArgs: string[],
) => {
  const firstQueryArg = queryArgs[0]
  const scopeCommand = firstQueryArg
    ? commands.find((command) => isStringsEqual(command.token, firstQueryArg))
    : undefined

  const nextArgs = queryArgs.slice(scopeCommand ? 1 : 0)
  const blockToken: BlockTokensTree = { queryArgs: nextArgs, command: scopeCommand }

  return findStopArgumentWithSuggestions(blockToken)
}

const skipOptionalArguments = (
  queryArg: string,
  commandIndex: number,
  commandArguments: IRedisCommand[],
  withLastMandatory = false
): {
  currentArgument: Maybe<IRedisCommand>
  optionalArguments: IRedisCommand[]
  index: number
} => {
  const optionalArguments = []
  let index = commandIndex + 1
  let currentArgument = commandArguments[index]
  while (index < commandArguments.length) {
    const argumentToken = currentArgument.token || currentArgument.arguments?.[0]?.token
    const isOptionalWithInput = isStringsEqual(queryArg, argumentToken)

    if (isOptionalWithInput || (currentArgument && !currentArgument.optional)) {
      return {
        optionalArguments: withLastMandatory ? [...optionalArguments, currentArgument] : optionalArguments,
        currentArgument,
        index
      }
    }

    optionalArguments.push(currentArgument)
    index++
    currentArgument = commandArguments[index]
  }

  return { optionalArguments, currentArgument, index }
}

const isCountArg = (arg?: Nullable<IRedisCommand>) => arg?.name === ArgName.NArgs || arg?.name === ArgName.Count
const isCountPositive = (count?: Maybe<number>) => isNumber(count) && count > 0
export const findStopArgument = (
  queryArgs: string[],
  command?: IRedisCommand,
  count?: Maybe<number>,
  forceReturn = false,
  skippedArguments: IRedisCommand[][] = []
) => {
  let commandIndex = 0
  let isBlocked = true
  let argsCount = count

  if (!command?.arguments) return null

  for (let i = 0; i < queryArgs.length; i++) {
    const queryArg = queryArgs[i]
    let currentArgument: Maybe<IRedisCommand> = command?.arguments[commandIndex]

    // handle optional arguments, iterate until we get token or non optional arguments
    // we check if we not blocked on optional token argument
    if (!isBlocked && (currentArgument?.optional || !forceReturn)) {
      const prevMandatoryIndex = findLastIndex(
        command.arguments.slice(0, commandIndex),
        (arg) => !arg.optional
      )
      const data = skipOptionalArguments(queryArg, prevMandatoryIndex, command.arguments)
      currentArgument = data.currentArgument
      commandIndex = data.index
    }

    if (!currentArgument && isCountPositive(count)) {
      commandIndex = 0
      currentArgument = command?.arguments[commandIndex]
    }

    if (!currentArgument && forceReturn) {
      return {
        queryArgsIterated: i,
        stopArgument: null,
        skippedArguments: []
      }
    }

    // handle pure token, if arg equals, then move to next command
    if (
      currentArgument?.type === ICommandTokenType.PureToken
      && isStringsEqual(queryArg, currentArgument.token)
    ) {
      isBlocked = false
      commandIndex++
      isNumber(argsCount) && argsCount--
      continue
    }

    // handle first iteration of token, if arg equals - stay on it and move on to check itself
    if (currentArgument?.token) {
      if (isStringsEqual(queryArg, currentArgument.token)) {
        isBlocked = true
        continue
      }

      if (isBlocked) isBlocked = false
      // token can be on block type
      if (currentArgument?.type !== ICommandTokenType.Block && !isCountArg(currentArgument)) {
        commandIndex++
        isNumber(argsCount) && argsCount--
        continue
      }
    }

    // handle block, we call the same function for block arguments
    if (currentArgument?.type === ICommandTokenType.Block) {
      const blockArgument: any = findStopArgument(
        queryArgs.slice(i),
        currentArgument,
        argsCount,
        true
      )

      if (blockArgument?.stopArgument) {
        return {
          ...blockArgument,
          blockParent: currentArgument
        }
      }

      i += (blockArgument?.queryArgsIterated || 1) - 1
      isBlocked = false

      const nextQueryArg = queryArgs[i]
      if (!nextQueryArg) return blockArgument

      if (currentArgument && !currentArgument.multiple) {
        commandIndex++
      }

      argsCount = 0
      continue
    }

    // handle one-of argument
    if (currentArgument?.type === ICommandTokenType.OneOf) {
      const isArgOneOf = currentArgument.arguments?.some(({ token }) => isStringsEqual(queryArg, token))
      if (isArgOneOf) {
        commandIndex++
        isNumber(argsCount) && argsCount--
        isBlocked = false
        continue
      }

      isBlocked = true
    }

    // handle multiple arguments, argsCount - number of arguments which have to be inserted
    if (currentArgument?.multiple) {
      isNumber(argsCount) && argsCount--

      if (argsCount === 0) {
        commandIndex++
        isBlocked = false
      }

      continue
    }

    // handle count argument with next multiple
    if (
      isCountArg(currentArgument)
      && command?.arguments[commandIndex + 1]?.multiple
    ) {
      argsCount = toNumber(queryArg) || 0

      if (argsCount === 0) {
        // skip next argument
        commandIndex += 2
        continue
      }

      commandIndex++
      isBlocked = true
      continue
    }

    commandIndex++
    isNumber(argsCount) && argsCount--
    isBlocked = false
  }

  const lastArgument: Maybe<IRedisCommand> = command?.arguments?.[commandIndex]

  console.log('last argument', lastArgument)

  const prevMandatoryIndex = findLastIndex(
    command.arguments.slice(0, commandIndex),
    (arg) => !arg.optional
  )
  const data = skipOptionalArguments('', prevMandatoryIndex, command.arguments, true)

  return {
    skippedArguments: [data.optionalArguments],
    // TODO: check this condition
    stopArgument: forceReturn
      ? (isCountPositive(argsCount) || isUndefined(argsCount) || argsCount <= 0) ? lastArgument : undefined
      : lastArgument,
    isBlocked,
    queryArgsIterated: queryArgs.length
  }
}

export const findStopArgumentWithSuggestions = (currentBlock: BlockTokensTree) => {
  console.log(currentBlock)

  const { queryArgs, command } = currentBlock
  const { isBlocked, stopArgument, skippedArguments, blockParent } = findStopArgument(queryArgs, command)

  console.log(stopArgument)

  if (isBlocked) {
    // TODO: check if it is blocked but next argument should suggest token
    const isBlockedWithSuggestions = stopArgument.type === ICommandTokenType.OneOf

    return {
      stopArg: stopArgument,
      append: [
        fillArgsByType(
          isBlockedWithSuggestions
            ? stopArgument.arguments
            : [stopArgument.arguments?.[0]]
        || [stopArgument]
        )
      ],
      isBlocked: !isBlockedWithSuggestions,
      parent: blockParent || command
    }
  }

  if (stopArgument && !stopArgument.optional) {
    return {
      append: [fillArgsByType([stopArgument])],
      stopArg: stopArgument,
      isBlocked: false,
      parent: blockParent || command
    }
  }

  const append = skippedArguments.map((arg) => fillArgsByType(arg, true))
  return {
    append,
    stopArg: stopArgument,
    isBlocked,
    parent: blockParent || command
  }
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

    if (expandBlock && currentArg?.type === ICommandTokenType.OneOf && !currentArg?.token) {
      result.push(...(currentArg?.arguments?.map((arg) => ({ ...arg, parent: currentArg })) || []))
    }

    if (currentArg?.token) {
      result.push(currentArg)
      continue
    }

    if (currentArg?.type === ICommandTokenType.Block) {
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
