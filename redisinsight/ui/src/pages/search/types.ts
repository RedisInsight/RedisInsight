import { Maybe } from 'uiSrc/utils'

export enum TokenType {
  PureToken = 'pure-token',
  Block = 'block',
  OneOf = 'oneof',
  String = 'string',
}

export enum ArgName {
  NArgs = 'nargs'
}

export interface SearchCommand {
  name?: string
  summary?: string
  expression?: boolean
  type?: TokenType
  token?: string
  optional?: boolean
  multiple?: boolean
  arguments?: SearchCommand[]
}

export interface SearchCommandTree extends SearchCommand {
  parent?: SearchCommandTree
}

export interface FoundCommandArgument {
  isComplete: boolean
  stopArg: Maybe<SearchCommand>
  isBlocked: boolean
  append: Maybe<Array<SearchCommandTree[]>>
  parent: Maybe<SearchCommand>
}

export interface CursorContext {
  prevCursorChar: string
  nextCursorChar: string
  isCursorInQuotes: boolean
  currentOffsetArg: string
  offset: number
  argLeftOffset: number
  argRightOffset: number
}
