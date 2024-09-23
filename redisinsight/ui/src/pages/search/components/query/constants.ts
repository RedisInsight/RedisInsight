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

export const SUPPORTED_COMMANDS_LIST = ['FT.SEARCH', 'FT.AGGREGATE', 'FT.PROFILE', 'FT.EXPLAIN']

export enum DefinedArgumentName {
  index = 'index',
  query = 'query',
  field = 'field',
  expression = 'expression'
}

export const FIELD_START_SYMBOL = '@'
