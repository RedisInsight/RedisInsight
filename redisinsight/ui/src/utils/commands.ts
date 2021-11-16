import { flatten, isArray, isEmpty, reject } from 'lodash'
import { CommandArgsType, CommandGroup, ICommandArg, ICommandArgGenerated } from 'uiSrc/constants'

export const getComplexityShortNotation = (text: string) =>
  (text.endsWith(')') && text.startsWith('O') ? text : '')

const generateArgName = (
  arg: ICommandArg,
  pureName: boolean = false,
  onlyMandatory: boolean = false
): string | string[] => {
  const { name: propName = '', enum: enumArg, command, optional, multiple, type, block } = arg

  if (onlyMandatory && optional) return ''

  const name = isArray(propName) ? propName?.join(' ') : propName
  const enumName = enumArg && (!pureName || !name) ? enumArg?.join('|') : name
  const commandName = command ? command + (enumName ? ` ${enumName}` : '') : enumName
  const optionalName = optional ? `[${commandName}]` : commandName

  const multipleNameTemp = [...commandName?.split?.(' '), `[${commandName} ...]`]
  const multipleName = optional ? `[${multipleNameTemp.join(' ')}]` : multipleNameTemp

  if (type === CommandArgsType.Block && isArray(block)) {
    const blocks = flatten(block?.map?.((block) => generateArgName(block, pureName)))
    return optional ? `[${blocks?.join?.(' ')}]` : blocks
  }

  return (multiple && !pureName && !onlyMandatory ? multipleName : optionalName) ?? ''
}

export const generateArgs = (args: ICommandArg[]): ICommandArgGenerated[] =>
  flatten(
    args.map((arg) => ({
      ...arg,
      generatedName: generateArgName(arg, true),
    }))
  )

export const generateArgsNames = (
  args: ICommandArg[],
  pureName: boolean = false,
  onlyMandatory: boolean = false
): string[] =>
  reject(
    flatten(
      args.map((arg) => generateArgName(arg, pureName, onlyMandatory))
    ),
    isEmpty
  )

export const getDocUrlForCommand = (
  commandName: string,
  commandGroup: CommandGroup | string = CommandGroup.Generic
): string => {
  let commandPage = ''
  switch (commandGroup) {
    case CommandGroup.Search:
      commandPage = commandName
        .replace(/\s+/g, '_')
        .replace(/[.]+/g, '')
        .toLowerCase()
      return `https://oss.redis.com/redisearch/Commands/#${commandPage}`
    case CommandGroup.JSON:
      commandPage = commandName
        .replace(/\s+/g, '_')
        .replace(/[.]+/g, '')
        .toLowerCase()
      return `https://oss.redis.com/redisjson/commands/#${commandPage}`
    default:
      commandPage = commandName.replace(/\s+/g, '-').toLowerCase()
      return `https://redis.io/commands/${commandPage}`
  }
}
