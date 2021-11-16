import React from 'react'
import WBResults from './WBResults'
import { WBHistoryObject } from '../../interfaces'
import { WBQueryType } from '../../constants'

export interface Props {
  historyItems: Array<WBHistoryObject>;
  scrollDivRef: React.Ref<HTMLDivElement>;
  onQueryRun: (query: string, historyId?: number, type?: WBQueryType) => void;
  onQueryDelete: (historyId: number) => void
}

const WBResultsWrapper = (props: Props) => (
  <WBResults {...props} />
)

export default WBResultsWrapper
