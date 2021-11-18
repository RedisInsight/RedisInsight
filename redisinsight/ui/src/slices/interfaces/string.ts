import { Nullable } from 'uiSrc/utils'

export interface StringState {
  loading: boolean
  error: string
  data: {
    key: string
    value: Nullable<string>
  }
}
