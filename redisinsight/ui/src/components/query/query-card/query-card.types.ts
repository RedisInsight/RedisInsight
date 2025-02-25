import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { ResultsMode, ResultsSummary, RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { Maybe } from 'uiSrc/utils'
import { CommandExecutionResult } from 'uiSrc/slices/interfaces'

export interface Props {
  id: string
  command: string
  isOpen: boolean
  result: Maybe<CommandExecutionResult[]>
  activeMode: RunQueryMode
  mode?: RunQueryMode
  activeResultsMode?: ResultsMode
  resultsMode?: ResultsMode
  emptyCommand?: boolean
  summary?: ResultsSummary
  createdAt?: Date
  loading?: boolean
  clearing?: boolean
  isNotStored?: boolean
  executionTime?: number
  db?: number
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryOpen: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}
