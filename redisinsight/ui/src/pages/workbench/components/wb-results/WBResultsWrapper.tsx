import React from 'react'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import WBResults from './WBResults'

export interface Props {
  items: CommandExecutionUI[]
  activeMode: RunQueryMode
  activeResultsMode: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  onQueryReRun: (query: string, commandId?: Nullable<string>, clearEditor?: boolean) => void
  onQueryOpen: (commandId: string) => void
  onQueryDelete: (commandId: string) => void
}

const WBResultsWrapper = (props: Props) => (
  <WBResults {...props} />
)

export default React.memo(WBResultsWrapper)
