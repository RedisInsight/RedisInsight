import { isInteger } from 'lodash'
import { CodeButtonResults, CodeButtonRunQueryMode } from 'uiSrc/constants'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { ExecuteQueryParams, IPluginVisualization, ResultsMode } from 'uiSrc/slices/interfaces'
import { getVisualizationsByCommand } from 'uiSrc/utils/plugins'

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

  const batchSize = (pipeline && isInteger(+pipeline)) ? +pipeline : batchSizeState
  const resultsMode = (results && results in CodeButtonResults) ? CodeButtonResults[results] : resultsModeState
  const activeRunQueryMode = (mode && mode in CodeButtonRunQueryMode)
    ? CodeButtonRunQueryMode[mode]
    : activeRunQueryModeState

  return { batchSize, resultsMode, activeRunQueryMode }
}

const isGroupMode = (mode?: ResultsMode) => mode === ResultsMode.GroupMode

export { getWBQueryType, getExecuteParams, isGroupMode }
