import React from 'react'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import WBResults from './WBResults'

export interface Props {
  items: CommandExecutionUI[]
  scrollDivRef: React.Ref<HTMLDivElement>
  onQueryReRun: (query: string, commandId?: Nullable<string>, clearEditor?: boolean) => void
  onQueryOpen: (commandId: string) => void
  onQueryDelete: (commandId: string) => void
}

const WBResultsWrapper = (props: Props) => (
  <WBResults {...props} />
)

export default WBResultsWrapper
