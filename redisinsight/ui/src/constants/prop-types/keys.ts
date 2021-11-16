import { KeyTypes } from '../keys'

export interface IKeyPropTypes {
  name: string;
  type: KeyTypes;
  ttl: number;
  size: number;
  length: number;
}

export interface IKeyListPropTypes {
  nextCursor: string;
  total: number;
  scanned: number;
  keys: IKeyPropTypes[];
}
