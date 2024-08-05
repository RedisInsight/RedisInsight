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
