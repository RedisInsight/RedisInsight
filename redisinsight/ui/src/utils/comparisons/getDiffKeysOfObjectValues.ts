import { isEqual, reduce } from 'lodash'

type UnknownObject = {
  [key: string]: any
}

export const getDiffKeysOfObjectValues = (obj1: UnknownObject = {}, obj2: UnknownObject = {}): string[] => reduce(
  obj1,
  (result: string[], value, key) => ((isEqual(value, obj2[key])) ? result : result.concat(key)),
  []
)
