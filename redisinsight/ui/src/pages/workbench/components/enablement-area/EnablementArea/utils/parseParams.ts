import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

export const parseParams = (params?: string): CodeButtonParams | undefined => {
  if (params?.match(/(^\[).+(]$)/g)) {
    return params
      ?.replace(/^\[|]$/g, '')
      ?.split(';')
      .reduce((prev: {}, next: string) => {
        const [key, value] = next.split('=')
        return {
          ...prev,
          [key]: value
        }
      }, {})
  }
  return undefined
}
