import { first, isInteger } from 'lodash'
import { CodeButtonResults, CodeButtonRunQueryMode } from 'uiSrc/constants'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { ExecuteQueryParams, IPluginVisualization, ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { getVisualizationsByCommand } from 'uiSrc/utils/plugins'
import { parseParams } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils'
import { getMonacoLines, isParamsLine } from './monaco'
import { Maybe } from './types'

const getWBQueryType = (query: string = '', views: IPluginVisualization[] = []) => {
  const defaultPluginView = getVisualizationsByCommand(query, views)
    .find((view) => view.default)

  return defaultPluginView ? WBQueryType.Plugin : WBQueryType.Text
}

const getExecuteParams = (params: CodeButtonParams = {}, state: ExecuteQueryParams): ExecuteQueryParams => {
  const {
    batchSize: batchSizeState,
    resultsMode: resultsModeState,
    activeRunQueryMode: activeRunQueryModeState
  } = state
  const { results, mode, pipeline } = params

  const batchSize = (pipeline && isInteger(+pipeline) && +pipeline >= 0) ? +pipeline : batchSizeState
  const resultsMode = (results && results in CodeButtonResults) ? CodeButtonResults[results] : resultsModeState
  const activeRunQueryMode = (mode && mode in CodeButtonRunQueryMode)
    ? CodeButtonRunQueryMode[mode]
    : activeRunQueryModeState

  return { batchSize, resultsMode, activeRunQueryMode }
}

export const getParsedParamsInQuery = (query: string) => {
  let parsedParams: Maybe<CodeButtonParams> = {}
  const lines = getMonacoLines(query)

  if (isParamsLine(first(lines))) {
    const paramsLine = lines.shift() || ''
    const params = paramsLine
      ?.substring?.(paramsLine.indexOf(']') + 1, 0)
      ?? ''

    parsedParams = parseParams(params)
  }

  return parsedParams
}

const isGroupMode = (mode?: ResultsMode) => mode === ResultsMode.GroupMode
const isRawMode = (mode?: RunQueryMode) => mode === RunQueryMode.Raw
const isSilentMode = (mode?: ResultsMode) => mode === ResultsMode.Silent
const isGroupResults = (mode?: ResultsMode) => mode === ResultsMode.GroupMode || mode === ResultsMode.Silent
const isSilentModeWithoutError = (mode?: ResultsMode, fail?: number) => isSilentMode(mode) && fail === 0

export {
  getWBQueryType,
  getExecuteParams,
  isGroupMode,
  isRawMode,
  isGroupResults,
  isSilentMode,
  isSilentModeWithoutError,
}
