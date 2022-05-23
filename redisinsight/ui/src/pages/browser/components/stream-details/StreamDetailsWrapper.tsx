import { EuiProgress, EuiTab, EuiTabs } from '@elastic/eui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { streamSelector, setStreamViewType, streamGroupsSelector } from 'uiSrc/slices/browser/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

import { streamViewTypeTabs } from './constants'
import ConsumersViewWrapper from './consumers-view'
import GroupsViewWrapper from './groups-view'
import StreamDataViewWrapper from './stream-data-view'
import StreamTabs from './stream-tabs'

export interface Props {
  isFooterOpen: boolean
}

const StreamDetailsWrapper = (props: Props) => {
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType, loading } = useSelector(streamSelector)
  const { loading: loadingGroups } = useSelector(streamGroupsSelector)

  const dispatch = useDispatch()

  return (
    <>
      {(loading || loadingGroups) && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-stream"
        />
      )}
      <StreamTabs />
      {viewType === StreamViewType.Data && (
        <StreamDataViewWrapper {...props} />
      )}
      {viewType === StreamViewType.Groups && (
        <GroupsViewWrapper {...props} />
      )}
      {viewType === StreamViewType.Consumers && (
        <ConsumersViewWrapper {...props} />
      )}
    </>
  )
}

export default StreamDetailsWrapper
