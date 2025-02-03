/* eslint-disable no-continue */
import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'
import { isStringsEqual, isTokenEqualsArg } from './helpers'

interface BlockTokensTree {
  queryArgs: string[]
  command?: IRedisCommand
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
        return getLastBlock(args.slice(i), currentArg, { queryArgs: queryArgs.slice(i), command: currentArg, parent })
      }
    }

    return parent
  }

  const blockToken: BlockTokensTree = { queryArgs: queryArgs.slice(scopeCommand ? 1 : 0), command: scopeCommand }
  const currentBlock = getLastBlock(queryArgs, scopeCommand, blockToken)
  const stopArgument = findStopArgumentWithSuggestions(currentBlock)

  console.log(stopArgument)

  return null
}

const getStopArgument = (
  queryArgs: string[],
  command: Maybe<IRedisCommand>
) => {
  let currentCommandArgIndex = 0

  for (let i = 0; i < queryArgs.length; i++) {
    const arg = queryArgs[i]
    const currentCommandArg = command?.arguments?.[currentCommandArgIndex]

    currentCommandArgIndex++
  }

  return null
}

const findStopArgumentWithSuggestions = (currentBlock: BlockTokensTree) => {
  console.log(currentBlock)
  const stopArgument = getStopArgument(currentBlock.queryArgs, currentBlock.command)

  return null
}

const findArgByToken = (list: IRedisCommand[], arg: string): Maybe<IRedisCommand> =>
  list.find((command) => isTokenEqualsArg(command, arg))
