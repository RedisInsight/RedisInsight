import { isNumber, remove } from 'lodash'
import { languages } from 'monaco-editor'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { Maybe, Nullable } from 'uiSrc/utils'
import { DefinedArgumentName } from 'uiSrc/pages/search/components/query/constants'
import { generateQuery } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensTemplates'

export const generateKeywords = (commands: SearchCommand[]) => commands.map(({ name }) => name)
export const generateTokens = (command?: SearchCommand): Nullable<{
  pureTokens: Array<Array<SearchCommand>>
  tokensWithQueryAfter: Array<Array<{ token: SearchCommand, arguments: SearchCommand[] }>>
}> => {
  if (!command) return null
  const pureTokens: Array<Array<SearchCommand>> = []
  const tokensWithQueryAfter: Array<Array<{ token: SearchCommand, arguments: SearchCommand[] }>> = []

  function processArguments(args: SearchCommand[], level = 0) {
    if (!pureTokens[level]) pureTokens[level] = []
    if (!tokensWithQueryAfter[level]) tokensWithQueryAfter[level] = []

    args.forEach((arg) => {
      if (arg.token) pureTokens[level].push(arg)

      if (arg.type === TokenType.Block && arg.arguments) {
        const blockToken = arg.arguments[0]
        const nextArgs = arg.arguments
        const isArgHasOwnSyntax = arg.arguments[0].expression && !!arg.arguments[0].arguments?.length

        if (blockToken?.token) {
          if (isArgHasOwnSyntax) {
            tokensWithQueryAfter[level].push({
              token: blockToken,
              arguments: arg.arguments[0].arguments as SearchCommand[]
            })
          } else {
            pureTokens[level].push(blockToken)
          }
        }

        processArguments(blockToken ? nextArgs.slice(1, nextArgs.length) : nextArgs, level + 1)
      }

      if (arg.type === TokenType.OneOf && arg.arguments) {
        arg.arguments.forEach((choice) => {
          if (choice?.token) pureTokens[level].push(choice)
        })
      }
    })
  }

  if (command.arguments) {
    processArguments(command.arguments, 0)
  }

  return { pureTokens, tokensWithQueryAfter }
}

export const isQueryAfterIndex = (command?: SearchCommand) => {
  if (!command) return false

  const index = command.arguments?.findIndex(({ name }) => name === DefinedArgumentName.index)
  return isNumber(index) && index > -1 ? command.arguments?.[index + 1]?.name === DefinedArgumentName.query : false
}

export const appendTokenWithQuery = (
  args: Array<{ token: SearchCommand, arguments: SearchCommand[] }>,
  level: number
): languages.IMonarchLanguageRule[] =>
  args.map(({ token }) => [`(${token.token})\\b`, { token: `argument.block.${level}`, next: `@query.${token.token}` }])

export const appendQueryWithNextFunctions = (tokens: Array<{ token: SearchCommand, arguments: SearchCommand[] }>): {
  [name: string]: languages.IMonarchLanguageRule[]
} => {
  let result: { [name: string]: languages.IMonarchLanguageRule[] } = {}

  tokens.forEach(({ token, arguments: args }) => {
    result = {
      ...result,
      ...generateQuery(token, args)
    }
  })

  return result
}

export const generateTokensWithFunctions = (
  tokens?: Array<Array<{ token: SearchCommand, arguments: SearchCommand[] }>>
): {
  [name: string]: languages.IMonarchLanguageRule[]
} => {
  if (!tokens) return { 'argument.block.withFunctions': [] }

  const actualTokens = tokens.filter((tokens) => tokens.length)

  return {
    'argument.block.withFunctions': [
      ...actualTokens
        .map((tokens, lvl) => appendTokenWithQuery(tokens, lvl))
        .flat()
    ],
    ...appendQueryWithNextFunctions(actualTokens.flat())
  }
}

export const getBlockTokens = (
  pureTokens: Maybe<Array<SearchCommand>[]>
): languages.IMonarchLanguageRule[] => {
  if (!pureTokens) return []

  const getLeveledToken = (
    tokens: SearchCommand[],
    lvl: number
  ): languages.IMonarchLanguageRule[] => {
    const result: languages.IMonarchLanguageRule[] = []
    const restTokens = [...tokens]
    const tokensWithNextExpression = remove(restTokens, (({ expression }) => expression))

    if (tokensWithNextExpression.length) {
      result.push([
        `(${tokensWithNextExpression.map(({ token }) => token).join('|')})\\b`,
        {
          token: `argument.block.${lvl}`,
          next: '@query'
        },
      ])
    }

    if (restTokens.length) {
      result.push([`(${restTokens.map(({ token }) => token).join('|')})\\b`, { token: `argument.block.${lvl}`, next: '@root' }])
    }

    return result
  }

  return pureTokens.map((tokens, lvl) => getLeveledToken(tokens, lvl)).flat()
}
