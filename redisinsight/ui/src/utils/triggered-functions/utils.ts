import { LIST_OF_FUNCTION_TYPES } from 'uiSrc/pages/triggered-functions/constants'
import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'

export const getFunctionsLengthByType = (functions: Array<{
  type: FunctionType
  name: string
}> = []) => LIST_OF_FUNCTION_TYPES.reduce((current, next) => ({
  ...current,
  [next.type]: functions?.filter((f) => f.type === next.type).length || 0
}), {})

const DEFAULT_LIBRARY_NAME = 'Library'

export const getLibraryName = (code: string): string => {
  try {
    const firstLine = code.split('\n')[0]
    const regexp = /name=[^\s\\]+/
    const matches = firstLine.match(regexp)
    return matches ? matches[0].split('=')[1].trim() : DEFAULT_LIBRARY_NAME
  } catch (err) {
    return DEFAULT_LIBRARY_NAME
  }
}
