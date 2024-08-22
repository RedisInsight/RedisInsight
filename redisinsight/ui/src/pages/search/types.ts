import { monaco as monacoEditor } from 'react-monaco-editor'
import { Maybe, Nullable } from 'uiSrc/utils'

export enum TokenType {
  PureToken = 'pure-token',
  Block = 'block',
  OneOf = 'oneof'
}

export enum ArgName {
  NArgs = 'nargs'
}

export interface SearchCommand {
  name?: string
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
  append: Maybe<SearchCommand[]>
  parent: Maybe<SearchCommand>
}

export interface CommandContext {
  commandName: string
  command: Maybe<SearchCommand>
  prevArgs: string[]
  allArgs: string[]
  currentCommandArg: Nullable<SearchCommand>
}

export interface CursorContext {
  isCursorInQuotes: boolean
  prevCursorChar: string
  nextCursorChar: string
  currentOffsetArg: any
  range: monacoEditor.IRange
}
