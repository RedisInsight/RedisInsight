import { merge } from 'lodash'
import { defaultMonacoOptions } from 'uiSrc/constants'

export const options = merge(defaultMonacoOptions,
  {
    suggest: {
      showWords: false,
      showIcons: true
    }
  })

export const SUPPORTED_COMMANDS_LIST = ['FT.SEARCH', 'FT.AGGREGATE']
