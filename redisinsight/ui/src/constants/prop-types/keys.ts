import { KeyTypes, ModulesKeyTypes } from '../keys'

export interface IKeyPropTypes {
  name: string
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  length: number
}

export interface IKeyListPropTypes {
  nextCursor: string
  total: number
  scanned: number
  keys: IKeyPropTypes[]
}
