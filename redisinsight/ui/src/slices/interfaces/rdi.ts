import { Nullable } from 'uiSrc/utils'

export interface IPipeline {
  config: string
  jobs: any[]
}

export interface IStateRdi {
  loading: boolean;
  error: string
  data: Nullable<IPipeline>
}
