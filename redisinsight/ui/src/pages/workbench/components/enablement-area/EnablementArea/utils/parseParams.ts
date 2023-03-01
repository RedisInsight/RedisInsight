import { identity, pickBy } from 'lodash'
import { Maybe } from 'uiSrc/utils'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

export const parseParams = (params?: string): Maybe<CodeButtonParams> => {
  if (params?.trim().match(/(^\[).+(]$)/g)) {
    return pickBy(params
      ?.trim()
      ?.replaceAll(' ', '')
      ?.replace(/^\[|]$/g, '')
      ?.split(';')
      .reduce((prev: {}, next: string) => {
        const [key, value] = next.split('=')
        return {
          [key]: value,
          ...prev,
        }
      }, {}),
    identity)
  }
  return undefined
}
