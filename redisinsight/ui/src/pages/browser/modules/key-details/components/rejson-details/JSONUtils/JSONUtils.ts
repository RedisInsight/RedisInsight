import { JSONScalarValue } from '../JSONInterfaces'
import styles from '../styles.module.scss'

enum ClassNames {
  string = 'jsonString',
  number = 'jsonNumber',
  object = 'jsonNull',
  boolean = 'jsonBoolean',
  others = 'jsonNonStringPrimitive'
}

export function isScalar(x: JSONScalarValue) {
  const t = typeof x

  return ['string', 'number', 'boolean'].indexOf(t) !== -1 || x === null
}

export function generatePath(parentPath: string, currentPath: string) {
  return `${parentPath}['${currentPath}']`
}

export const getClassNameByValue = (value: any) => {
  const type = typeof value
  const className = (type in ClassNames) ? ClassNames[type] : ClassNames.others
  return styles[className]
}
