import { toNumber, transform, isNaN } from 'lodash'

export const transformQueryParamsObject = (properties: Record<string, any> = {}) =>
  transform(properties, (result: Record<string, any>, value, key) => {
    if (value === 'true') {
      result[key] = true
      return
    }
    if (!isNaN(toNumber(value))) {
      result[key] = toNumber(value)
      return
    }

    result[key] = value
  }, {})
