import { EuiTab, EuiTabs } from '@elastic/eui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { streamSelector, setStreamViewType } from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

import { streamViewTypeTabs } from '../constants'

const StreamTabs = () => {
  const { viewType } = useSelector(streamSelector)

  const dispatch = useDispatch()

  const onSelectedTabChanged = (id: StreamViewType) => {
    dispatch(setStreamViewType(id))
  }

  const renderTabs = () =>
    streamViewTypeTabs.map(({ id, label }, i) => (
      <EuiTab
        isSelected={id === viewType}
        onClick={() => onSelectedTabChanged(id)}
      // eslint-disable-next-line react/no-array-index-key
        key={i}
      >
        {label}
      </EuiTab>
    ))

  return (
    <EuiTabs display="condensed">{renderTabs()}</EuiTabs>
  )
}

export default StreamTabs
