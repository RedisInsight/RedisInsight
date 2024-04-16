import { isArray } from 'lodash'
import { JSONErrors } from '../constants'
import { JSONScalarValue, ObjectTypes } from '../interfaces'
import styles from '../styles.module.scss'

enum ClassNames {
  string = 'jsonString',
  number = 'jsonNumber',
  object = 'jsonNull',
  boolean = 'jsonBoolean',
  others = 'jsonNonStringPrimitive'
}

export function isScalar(x: JSONScalarValue) {
  return ['string', 'number', 'boolean'].indexOf(typeof x) !== -1 || x === null
}

export const isValidJSON = (value: string): boolean => {
  try {
    JSON.parse(value)
    return true
  } catch (e) {
    return false
  }
}

export const generatePath = (parentPath: string, keyName: string | number) => {
  const currentPath = typeof keyName === 'number' ? `${keyName}` : `'${keyName}'`
  return parentPath ? `${parentPath}[${currentPath}]` : `[${currentPath}]`
}

export const wrapPath = (key: string, path: string = '') => {
  try {
    const unescapedKey = JSON.parse(key!)
    return unescapedKey.includes('"') ? `${path}['${unescapedKey}']` : `${path}["${unescapedKey}"]`
  } catch {
    return null
  }
}

export const validateRejsonValue = (value: any) => {
  try {
    JSON.parse(value as string)
    return null
  } catch (e) {
    return JSONErrors.valueJSONFormat
  }
}

export const getClassNameByValue = (value: any) => {
  const type = typeof value
  // @ts-ignore
  const className = (type in ClassNames) ? ClassNames[type] : ClassNames.others
  return styles[className]
}

export const isRealObject = (data: any, knownType?: string) => {
  if (knownType === ObjectTypes.Object) return true
  return typeof data === ObjectTypes.Object && data !== null && !(data instanceof Array)
}

export const isRealArray = (data: any, knownType?: string) => {
  if (knownType === ObjectTypes.Array) return true
  return isArray(data)
}

export const getBrackets = (type: string, position: 'start' | 'end' = 'start') => {
  if (type === ObjectTypes.Array) return position === 'start' ? '[' : ']'
  return position === 'start' ? '{' : '}'
}

export const isValidKey = (key: string): boolean => /^"([^"\\]|\\.)*"$/.test(key)
