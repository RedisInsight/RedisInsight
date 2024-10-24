import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'

export const isStringsEqual = (str1?: string, str2?: string) => str1?.toLowerCase() === str2?.toLowerCase()

export const isTokenEqualsArg = (token: IRedisCommand, arg: string) => {
  if (token.type === ICommandTokenType.OneOf) {
    return token.arguments
      ?.some((oneOfArg: IRedisCommand) => isStringsEqual(oneOfArg?.token, arg))
  }
  if (isStringsEqual(token.token, arg)) return true
  if (token.type === ICommandTokenType.Block) return isStringsEqual(token.arguments?.[0]?.token, arg)
  return false
}

export const findArgByToken = (list: IRedisCommand[], arg: string): Maybe<IRedisCommand> =>
  list.find((command) => isTokenEqualsArg(command, arg))
