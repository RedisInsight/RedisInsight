import { AutoExecute, ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'

export const CodeButtonResults = {
  group: ResultsMode.GroupMode,
  single: ResultsMode.Default,
  [ResultsMode.GroupMode]: ResultsMode.GroupMode,
  [ResultsMode.Default]: ResultsMode.Default,
}

export const CodeButtonRunQueryMode = {
  raw: RunQueryMode.Raw,
  ascii: RunQueryMode.ASCII,
  [RunQueryMode.Raw]: RunQueryMode.Raw,
  [RunQueryMode.ASCII]: RunQueryMode.ASCII,
}

export const CodeButtonAutoExecute = {
  true: AutoExecute.True,
  false: AutoExecute.False,
}
