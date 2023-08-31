import { Nullable } from 'uiSrc/utils'

export enum UrlHandlingActions {
  Connect = 'databases/connect'
}
export interface StateUrlHandling {
  fromUrl: Nullable<string>
  action: Nullable<UrlHandlingActions>
  dbConnection: Nullable<any>
  properties: Record<string, any>
}
