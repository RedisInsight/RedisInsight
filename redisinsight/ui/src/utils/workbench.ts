import { first, identity, isInteger, pickBy } from 'lodash'
import { CodeButtonResults, CodeButtonRunQueryMode, CodeButtonParams } from 'uiSrc/constants'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { EnablementAreaComponent, ExecuteQueryParams, IEnablementAreaItem, IPluginVisualization, ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { getVisualizationsByCommand } from 'uiSrc/utils/plugins'
import { getMonacoLines, isParamsLine } from './monaco'
import { Maybe, Nullable } from './types'

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

export const findMarkdownPathByPath = (manifest: IEnablementAreaItem[], markdownPath: string) => {
  if (!manifest) return null

  const findPath = (data: IEnablementAreaItem[], mdPath: string, path: number[] = []): Nullable<number[]> => {
    for (let i = 0; i < data.length; i++) {
      const obj = data[i]
      const currentPath = [...path, i]

      if (obj.type === EnablementAreaComponent.InternalLink && obj.args?.path?.includes(mdPath)) {
        return currentPath
      }

      if (obj.type === EnablementAreaComponent.Group && obj.children) {
        const result = findPath(obj.children, mdPath, currentPath)

        if (result) {
          return result
        }
      }
    }

    return null
  }

  const result = findPath(manifest, markdownPath)
  return result ? result.join('/') : null
}

export const findMarkdownPathById = (
  manifest: IEnablementAreaItem[] = [],
  id: string = '',
): Nullable<IEnablementAreaItem> => {
  const stack = [...manifest]

  while (stack.length > 0) {
    const currentObject = stack.pop()

    if (currentObject?.id === id) {
      return currentObject
    }

    if (currentObject?.children) {
      stack.push(...currentObject.children)
    }
  }

  return null
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
