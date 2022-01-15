import { DataTypes } from '../keys'

export interface IKeyPropTypes {
  name: string;
  type: DataTypes;
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
