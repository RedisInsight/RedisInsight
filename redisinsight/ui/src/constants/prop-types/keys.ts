import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { GetKeyInfoResponse } from 'uiSrc/api-client'
import { KeyTypes, ModulesKeyTypes } from '../keys'

export interface IKeyPropTypes extends GetKeyInfoResponse {
  nameString: string
  name: RedisResponseBuffer
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  length: number
}

export interface IFetchKeyArgs {
  resetData?: boolean
  start?: number
  end?: number
}
