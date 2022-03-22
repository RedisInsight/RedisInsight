import { flatten, isArray, isEmpty, isNumber, reject, toNumber, isNaN, isInteger } from 'lodash'
import {
  CommandArgsType,
  CommandPrefix,
  ICommandArg,
  ICommandArgGenerated
} from 'uiSrc/constants'

export const getComplexityShortNotation = (complexity: string[] | string): string => {
  const value = isArray(complexity) ? complexity.join(' ') : complexity
  return value.endsWith(')') && value.startsWith('O') ? value : ''
}

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
    const blocks = flatten(block?.map?.((block) => generateArgName(block, pureName, onlyMandatory)))
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

const getExternalCommandFormat = (commandName = '') =>
  commandName
    .replace(/\s+/g, '_')
    .replace(/[.]+/g, '')
    .toLowerCase()

export const getDocUrlForCommand = (
  commandName: string,
): string => {
  let command = getExternalCommandFormat(commandName)
  const commandStartsWith = commandName.split('.')[0]

  switch (commandStartsWith) {
    case CommandPrefix.Search:
      return `https://oss.redis.com/redisearch/Commands/#${command}`
    case CommandPrefix.JSON:
      return `https://oss.redis.com/redisjson/commands/#${command}`
    case CommandPrefix.TimeSeries:
      return `https://oss.redis.com/redistimeseries/commands/#${command}`
    case CommandPrefix.Graph:
      return `https://oss.redis.com/redisgraph/commands/#${command}`
    case CommandPrefix.AI:
      return `https://oss.redis.com/redisai/commands/#${command}`
    case CommandPrefix.Gears:
      return `https://oss.redis.com/redisgears/commands.html#${command}`
    case CommandPrefix.BloomFilter:
      return `https://oss.redis.com/redisbloom/Bloom_Commands/#${command}`
    case CommandPrefix.CuckooFilter:
      return `https://oss.redis.com/redisbloom/Cuckoo_Commands/#${command}`
    case CommandPrefix.CountMinSketchFilter:
      return `https://oss.redis.com/redisbloom/CountMinSketch_Commands/#${command}`
    case CommandPrefix.TopK:
      return `https://oss.redis.com/redisbloom/TopK_Commands/#${command}`
    default:
      command = commandName.replace(/\s+/g, '-').toLowerCase()
      return `https://redis.io/commands/${command}`
  }
}

export const getCommandRepeat = (command = ''): [string, number] => {
  const [countRepeatStr, ...restCommand] = command.split(' ')
  let countRepeat = toNumber(countRepeatStr)
  let commandLine = restCommand.join(' ')
  if (!isNumber(countRepeat) || isNaN(countRepeat) || !command) {
    countRepeat = 1
    commandLine = command
  }

  return [commandLine, countRepeat]
}

export const isRepeatCountCorrect = (number: number): boolean => number >= 1 && isInteger(number)
