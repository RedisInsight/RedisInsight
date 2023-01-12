import { CodeButtonAutoExecute, CodeButtonResults, CodeButtonRunQueryMode } from 'uiSrc/constants'

export interface CodeButtonParams {
  clearEditor?: boolean
  pipeline?: string
  auto?: keyof typeof CodeButtonAutoExecute
  results?: keyof typeof CodeButtonResults
  mode?: keyof typeof CodeButtonRunQueryMode
}

export enum ExecuteButtonMode {
  Auto = 'auto',
  Manual = 'manual'
}
