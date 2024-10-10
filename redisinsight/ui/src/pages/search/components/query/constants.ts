import { merge } from 'lodash'
import { defaultMonacoOptions } from 'uiSrc/constants'

export const options = merge(defaultMonacoOptions,
  {
    suggest: {
      showWords: false,
      showIcons: true,
      insertMode: 'replace',
      filterGraceful: false,
      matchOnWordStartOnly: true
    }
  })

export const COMMANDS_TO_GET_INDEX_INFO = [
  'FT.SEARCH',
  'FT.AGGREGATE',
  'FT.EXPLAIN',
  'FT.EXPLAINCLI',
  'FT.PROFILE',
  'FT.SPELLCHECK',
  'FT.TAGVALS',
  'FT.ALTER',
  'FT.CREATE'
]

export const COMPOSITE_ARGS = [
  'LOAD *',
  'FT.CONFIG GET',
  'FT.CONFIG SET',
  'FT.CURSOR DEL',
  'FT.CURSOR READ',
]

export enum DefinedArgumentName {
  index = 'index',
  query = 'query',
  field = 'field',
  expression = 'expression'
}

export const FIELD_START_SYMBOL = '@'
export enum EmptySuggestionsIds {
  NoIndexes = 'no-indexes'
}
