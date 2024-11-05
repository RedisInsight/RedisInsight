/* eslint-disable no-continue */
import { findLastIndex, toNumber } from 'lodash'
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
    }

    return parent
  }

  const nextArgs = queryArgs.slice(scopeCommand ? 1 : 0)
  const blockToken: BlockTokensTree = { queryArgs: nextArgs, command: scopeCommand }
  const lastFoundBlock = getLastBlock(nextArgs, scopeCommand, blockToken)

  return findStopArgumentWithSuggestions(blockToken)
}

const skipOptionalArguments = (
  queryArg: string,
  commandIndex: number,
  commandArguments: IRedisCommand[],
): {
  currentArgument: Maybe<IRedisCommand>
  optionalArguments: IRedisCommand[]
  index: number
} => {
  const optionalArguments = []
  let index = commandIndex + 1
  let currentArgument = commandArguments[index]

  while (index < commandArguments.length) {
    const argumentToken = currentArgument.arguments?.[0]?.token || currentArgument.token
    const isOptionalWithInput = (
      currentArgument?.type !== ICommandTokenType.PureToken && isStringsEqual(queryArg, argumentToken)
    )

    if (isOptionalWithInput || (currentArgument && !currentArgument.optional)) {
      return { optionalArguments, currentArgument, index }
    }

    optionalArguments.push(currentArgument)
    index++
    currentArgument = commandArguments[index]
  }

  return { optionalArguments, currentArgument, index }
}

const isCountArg = (arg?: Nullable<IRedisCommand>) => arg?.name === ArgName.NArgs || arg?.name === ArgName.Count
const findStopArgument = (
  queryArgs: string[],
  command?: IRedisCommand,
  count: number = 0,
  skippedArguments: IRedisCommand[][] = []
) => {
  let commandIndex = 0
  let isBlocked = true
  let argsCount = count

  if (!command?.arguments) return null

  for (let i = 0; i < queryArgs.length; i++) {
    const queryArg = queryArgs[i]
    let currentArgument: Maybe<IRedisCommand> = command?.arguments[commandIndex]

    if (!currentArgument && argsCount > 0) {
      commandIndex = 0
      currentArgument = command?.arguments[commandIndex]
    }

    console.log(queryArgs, currentArgument)

    // // if no argument, we still can apply all optional after last mandatory
    // if (!currentArgument) {
    //   const lastMandatoryIndex = findLastIndex(
    //     command.arguments.slice(0, commandIndex),
    //     (arg) => !arg.optional
    //   )
    //   commandIndex = lastMandatoryIndex > -1 ? lastMandatoryIndex + 1 : commandIndex
    //   currentArgument = command?.arguments[commandIndex]
    // }

    // handle optional arguments, iterate until we get token or non optional arguments
    // we check if we not blocked on optional token argument
    if (!isBlocked && currentArgument?.optional) {
      const prevMandatoryIndex = findLastIndex(
        command.arguments.slice(0, commandIndex),
        (arg) => !arg.optional
      )
      const data = skipOptionalArguments(queryArg, prevMandatoryIndex, command.arguments)
      currentArgument = data.currentArgument
      // skippedArguments.push(data.optionalArguments)
      commandIndex = data.index
    }

    // handle pure token, if arg equals, then move to next command
    if (
      currentArgument?.type === ICommandTokenType.PureToken
      && isStringsEqual(queryArg, currentArgument.token)
    ) {
      isBlocked = false
      commandIndex++
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
        continue
      }
    }

    // handle block, we call the same function for block arguments
    if (currentArgument?.type === ICommandTokenType.Block) {
      console.log('handle block', currentArgument)

      const a = findStopArgument(
        queryArgs.slice(i),
        currentArgument,
        argsCount
      )
      console.log(a)
      return {
        stopArgument: null,
        skippedArguments: []
      }
      // const blockQueryArgs = queryArgs.slice(i)
      // let blockArguments = currentArgument.arguments ? [...currentArgument.arguments] : []
      // if (currentArgument.multiple && argsCount) {
      //   blockArguments = Array(Math.round(argsCount / blockArguments?.length))
      //     .fill(currentArgument.arguments).flat().slice(0, argsCount)
      // }
      //
      // const command = {
      //   ...currentArgument,
      //   arguments: blockArguments
      // }
      // const block: any = findStopArgument(blockQueryArgs, command, skippedArguments)
      // if (isBlocked || block.isBlocked || block.stopArgument) {
      //   return {
      //     ...block,
      //     skippedArguments: [fillArgsByType([block.stopArgument])],
      //     blockParent: currentArgument
      //   }
      // }
      //
      // // since we iterated throw the block and completed it we need to skip number of args from this block
      // // TODO: wrong
      // i += blockQueryArgs.length - 1
      // commandIndex++
      // isBlocked = false
      // continue
    }

    // handle one-of argument
    if (currentArgument?.type === ICommandTokenType.OneOf) {
      const isArgOneOf = currentArgument.arguments?.some(({ token }) => isStringsEqual(queryArg, token))
      if (isArgOneOf) {
        commandIndex++
        isBlocked = false
        continue
      }

      isBlocked = true
    }

    // handle multiple arguments, argsCount - number of arguments which have to be inserted
    if (currentArgument?.multiple) {
      argsCount--

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

    console.log('finished iteration', currentArgument, queryArg, command.arguments)
    commandIndex++
    isBlocked = false
  }

  const lastArgument: Maybe<IRedisCommand> = command?.arguments?.[commandIndex]
  // if (!lastArgument) {
  //   const prevMandatoryIndex = findLastIndex(
  //     command.arguments.slice(0, commandIndex),
  //     (arg) => !arg.optional
  //   )
  //   const data = skipOptionalArguments('', prevMandatoryIndex, command.arguments)
  //   lastArgument = data.currentArgument
  //   if (data.optionalArguments.length) {
  //     skippedArguments.push(data.optionalArguments)
  //   }
  // }

  return {
    skippedArguments,
    stopArgument: lastArgument,
    isBlocked
  }
}

const findStopArgumentWithSuggestions = (currentBlock: BlockTokensTree) => {
  console.log(currentBlock)

  const { queryArgs, command } = currentBlock
  const { isBlocked, stopArgument, skippedArguments, blockParent } = findStopArgument(queryArgs, command)

  console.log({ stopArgument, isBlocked, skippedArguments, blockParent })

  if (isBlocked) {
    return {
      stopArg: stopArgument,
      append: fillArgsByType([stopArgument]),
      isBlocked: true,
      parent: blockParent || command
    }
  }

  const append = skippedArguments.map(fillArgsByType)
  return {
    append,
    stopArg: stopArgument,
    isBlocked,
    parent: blockParent || command
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
