export const InfoAttributesBoolean: string[] = ['NOSTEM', 'NOINDEX', 'SORTABLE']

export enum Command {
  Search = 'FT.SEARCH',
  Aggregate = 'FT.AGGREGATE',
  Info = 'FT.INFO',
}

export enum CommandArgument {
  NoContent = 'NOCONTENT',
  Return = 'RETURN',
  Highlight = 'HIGHLIGHT',
  WithScores = 'WITHSCORES',
  WithPayloads = 'WITHPAYLOADS',
  WithSortKeys = 'WITHSORTKEYS',
}

export enum ResultFieldNameView {
  Score = 'Score',
  Payloads = 'Payloads',
  Name = 'Name',
}

export enum ResultInfoField {
  Attributes = 'attributes',
  Fields = 'fields',
  Options = 'index_options',
}

export const ResultInfoAttributes: string[] = [
  'Name',
  'Type',
  'WEIGHT',
  'NOSTEM',
  'NOINDEX',
  'SORTABLE',
  'SEPARATOR',
  'PHONETIC',
]

export enum DataTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [DataTypes.Hash]: 'Hash',
  [DataTypes.List]: 'List',
  [DataTypes.Set]: 'Set',
  [DataTypes.ZSet]: 'Zset',
  [DataTypes.String]: 'String',
  [DataTypes.ReJSON]: 'JSON',
  [DataTypes.JSON]: 'JSON'
})

// Enums don't allow to use dynamic key
export const GROUP_TYPES_COLORS = Object.freeze({
  [DataTypes.Hash]: 'var(--typeHashColor)',
  [DataTypes.List]: 'var(--typeListColor)',
  [DataTypes.Set]: 'var(--typeSetColor)',
  [DataTypes.ZSet]: 'var(--typeZSetColor)',
  [DataTypes.String]: 'var(--typeStringColor)',
  [DataTypes.ReJSON]: 'var(--typeReJSONColor)',
  [DataTypes.JSON]: 'var(--typeReJSONColor)',
})
