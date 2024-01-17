import { JSONErrors } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/constants'
import { JSONScalarValue } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
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

export const convertStringToNumberOrKeepString = (str: string) => {
  const parsedNumber = parseFloat(str)
  return Number.isNaN(parsedNumber) ? str : parsedNumber
}

export const generatePath = (parentPath: string, keyName: string | number) => {
  const currentPath = typeof keyName === 'number' ? `${keyName}` : `'${keyName}'`
  console.log(parentPath ? `${parentPath}[${currentPath}]` : `[${currentPath}]`)
  return parentPath ? `${parentPath}[${currentPath}]` : `[${currentPath}]`
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
  const className = (type in ClassNames) ? ClassNames[type] : ClassNames.others
  return styles[className]
}
