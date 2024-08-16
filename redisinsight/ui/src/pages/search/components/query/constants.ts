import { merge } from 'lodash'
import { defaultMonacoOptions } from 'uiSrc/constants'

export const options = merge(defaultMonacoOptions,
  {
    suggest: {
      showWords: false,
      showIcons: true,
      insertMode: 'replace',
    }
  })

export const SUPPORTED_COMMANDS_LIST = ['FT.SEARCH', 'FT.AGGREGATE']

export enum DefinedArgumentName {
  index = 'index',
  query = 'query',
  field = 'field',
}
