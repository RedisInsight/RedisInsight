import { KeyTypes, ModulesKeyTypes } from '../keys'

export interface IKeyPropTypes {
  name: string
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  length: number
}
