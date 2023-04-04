import { flatten, isArray, isEmpty, isNumber, reject, toNumber, isNaN, isInteger } from 'lodash'
import {
  ICommandArg,
  ICommandArgGenerated
} from 'uiSrc/constants'

enum ArgumentType {
  INTEGER = 'integer',
  DOUBLE = 'double',
  STRING = 'string',
  UNIX_TIME = 'unix-time',
  PATTERN = 'pattern',
  KEY = 'key',
  ONEOF = 'oneof',
  BLOCK = 'block',
  PURE_TOKEN = 'pure-token',
  COMMAND = 'command',
}

export class Argument {
  protected stack = []

  protected name: string

  protected type: ArgumentType

  protected optional: boolean

  protected multiple: boolean

  protected multipleToken: boolean

  protected token: string | null

  protected display: string

  protected arguments: Argument[]

  constructor(data: Record<string, any>) {
    this.stack = []
    this.name = data?.name
    this.type = data?.type
    this.optional = !!data?.optional
    this.multiple = !!data?.multiple
    this.multipleToken = !!data?.multiple_token
    this.token = data?.token
    this.display = data?.display_text || this.name
    // todo: why we need this?
    if (this.token === '') {
      this.token = '""'
    }
    this.arguments = ((data?.arguments || []) as Record<string, any>[])
      .map((childArg) => new Argument(childArg))
  }

  public syntax(opts: Record<string, any> = {}): string {
    const showTypes = !!opts?.showTypes
    const pureName = !!opts?.pureName
    const onlyMandatory = !!opts?.onlyMandatory

    if (onlyMandatory && this.optional) {
      return ''
    }

    let args = ''

    switch (this.type) {
      case ArgumentType.BLOCK:
        args += this.arguments.map((arg) => arg.syntax()).join(' ')
        break
      case ArgumentType.ONEOF:
        args += this.arguments.map((arg) => arg.syntax()).join(' | ')
        break
      case ArgumentType.PURE_TOKEN:
        break
      default:
        args += this.display
        if (showTypes) {
          args += `:${this.type}`
        }
    }

    let syntax = ''

    if (this.token) {
      syntax += this.token
      if (this.type !== ArgumentType.PURE_TOKEN) {
        syntax += ' '
      }
    }

    let multipleSyntax = ''
    if (this.multiple && !pureName) {
      if (this.multipleToken) {
        multipleSyntax += `${args} [${this.token} ${args} ...]`
      } else {
        multipleSyntax += `${args} [${args} ...]`
      }
    } else {
      multipleSyntax += args
    }

    if (this.type === ArgumentType.ONEOF && (!this.optional || this.token)) {
      multipleSyntax = `<${multipleSyntax}>`
    }

    syntax += multipleSyntax

    if (this.optional) {
      syntax = `[${syntax}]`
    }

    return syntax
  }
}

export const getComplexityShortNotation = (complexity: string[] | string): string => {
  const value = isArray(complexity) ? complexity.join(' ') : complexity
  return value.endsWith(')') && value.startsWith('O') ? value : ''
}

const generateArgName = (
  arg: ICommandArg,
  pureName: boolean = false,
  onlyMandatory: boolean = false
): string | string[] => {
  try {
    return (new Argument(arg)).syntax({
      onlyMandatory,
      pureName,
    })
  } catch (e) {
    return ''
  }

  // DO NOT DELETE.
  // We need this for now to compare old behaviour when needed
  //
  // const { name: propName = '', enum: enumArg, command, optional, multiple, type, block } = arg
  //
  // if (onlyMandatory && optional) return ''
  //
  // const name = isArray(propName) ? propName?.join(' ') : propName
  // const enumName = enumArg && (!pureName || !name) ? enumArg?.join('|') : name
  // const commandName = command ? command + (enumName ? ` ${enumName}` : '') : enumName
  // const optionalName = optional ? `[${commandName}]` : commandName
  //
  // const multipleNameTemp = [...commandName?.split?.(' '), `[${commandName} ...]`]
  // const multipleName = optional ? `[${multipleNameTemp.join(' ')}]` : multipleNameTemp
  //
  // if (type === CommandArgsType.Block && isArray(block)) {
  //   const blocks = flatten(block?.map?.((block) => generateArgName(block, pureName, onlyMandatory)))
  //   return optional ? `[${blocks?.join?.(' ')}]` : blocks
  // }
  //
  // return (multiple && !pureName && !onlyMandatory ? multipleName : optionalName) ?? ''
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

export const getDocUrlForCommand = (commandName: string): string => {
  const command = commandName.replace(/\s+/g, '-').toLowerCase()
  return `https://redis.io/commands/${command}`
}

export const getCommandRepeat = (command = ''): [string, number] => {
  const [countRepeatStr = '', ...restCommand] = command?.split?.(' ')
  let countRepeat = toNumber(countRepeatStr)
  let commandLine = restCommand.join(' ')
  if (!isNumber(countRepeat) || isNaN(countRepeat) || !command) {
    countRepeat = 1
    commandLine = command
  }

  return [commandLine, countRepeat]
}

export const isRepeatCountCorrect = (number: number): boolean => number >= 1 && isInteger(number)
