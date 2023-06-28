import { LIST_OF_FUNCTION_TYPES } from 'uiSrc/pages/triggeredFunctions/constants'
import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'

export const getFunctionsLengthByType = (functions: Array<{
  type: FunctionType
  name: string
}> = []) => LIST_OF_FUNCTION_TYPES.reduce((current, next) => ({
  ...current,
  [next.type]: functions?.filter((f) => f.type === next.type).length || 0
}), {})
