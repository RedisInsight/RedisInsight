import { CodeButtonResults, CodeButtonRunQueryMode } from 'uiSrc/constants'

export interface CodeButtonParams {
  clearEditor?: boolean
  pipeline?: string
  results?: keyof typeof CodeButtonResults
  mode?: keyof typeof CodeButtonRunQueryMode
}

export enum ExecuteButtonMode {
  Auto = 'auto',
  Manual = 'manual'
}
