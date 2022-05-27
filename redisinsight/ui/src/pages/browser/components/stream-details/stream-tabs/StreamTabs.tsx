import React from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import {
  streamSelector,
  setStreamViewType,
  fetchConsumerGroups,
  streamGroupsSelector,
} from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

import { streamViewTypeTabs } from '../constants'

const StreamTabs = () => {
  const { viewType, data: { entries = [] } } = useSelector(streamSelector)
  const { data: groups = [] } = useSelector(streamGroupsSelector)

  const dispatch = useDispatch()

  const onSelectedTabChanged = (id: StreamViewType) => {
    dispatch(setStreamViewType(id))

    if (id === StreamViewType.Data && entries?.length === 0) {
      // dispatch(fetchConsumerGroups())
    }
    if (id === StreamViewType.Groups && groups.length === 0) {
      dispatch(fetchConsumerGroups())
    }
  }

  const getSelectedTab = (id:StreamViewType) => {
    if (id === StreamViewType.Data && viewType === id) {
      return true
    }

    if (id === StreamViewType.Groups
        && (viewType === id || viewType === StreamViewType.Consumers || viewType === StreamViewType.Messages)) {
      return true
    }

    return false
  }

  const renderTabs = () =>
    streamViewTypeTabs.map(({ id, label }, i) => (
      <EuiTab
        isSelected={getSelectedTab(id)}
        onClick={() => onSelectedTabChanged(id)}
      // eslint-disable-next-line react/no-array-index-key
        key={i}
      >
        {label}
      </EuiTab>
    ))

  return (
    <EuiTabs>{renderTabs()}</EuiTabs>
  )
}

export default StreamTabs
