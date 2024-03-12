import React, { useCallback } from 'react'
import { EuiIcon, EuiTab, EuiTabs } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  streamSelector,
  setStreamViewType,
  fetchConsumerGroups,
  selectedGroupSelector,
  selectedConsumerSelector,
  fetchStreamEntries,
} from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { ConsumerGroupDto } from 'apiSrc/modules/browser/stream/dto'

import { streamViewTypeTabs } from '../constants'

import styles from './styles.module.scss'

const StreamTabs = () => {
  const { viewType } = useSelector(streamSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { nameString: selectedGroupName = '' } = useSelector(selectedGroupSelector) ?? {}
  const { nameString: selectedConsumerName = '' } = useSelector(selectedConsumerSelector) ?? {}

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  const onSuccessLoadedConsumerGroups = (data: ConsumerGroupDto[]) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUPS_LOADED,
      eventData: {
        databaseId: instanceId,
        length: data.length
      }
    })
  }

  const onSelectedTabChanged = (id: StreamViewType) => {
    if (id === StreamViewType.Data) {
      dispatch<any>(fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        SortOrder.DESC,
        true
      ))
    }
    if (id === StreamViewType.Groups) {
      dispatch(fetchConsumerGroups(
        true,
        onSuccessLoadedConsumerGroups,
      ))
    }
    dispatch(setStreamViewType(id))
  }

  const renderTabs = useCallback(() => {
    const tabs = [...streamViewTypeTabs]

    if (selectedGroupName && (viewType === StreamViewType.Consumers || viewType === StreamViewType.Messages)) {
      tabs.push({
        id: StreamViewType.Consumers,
        label: selectedGroupName,
        separator: <EuiIcon type="arrowRight" className={styles.separator} />
      })
    }

    if (selectedConsumerName && viewType === StreamViewType.Messages) {
      tabs.push({
        id: StreamViewType.Messages,
        label: selectedConsumerName,
        separator: <EuiIcon type="arrowRight" className={styles.separator} />
      })
    }

    return tabs.map(({ id, label }) => (
      <EuiTab
        isSelected={viewType === id}
        onClick={() => onSelectedTabChanged(id)}
        key={id}
        data-testid={`stream-tab-${id}`}
      >
        {label}
      </EuiTab>
    ))
  }, [viewType, selectedGroupName, selectedConsumerName])

  return (
    <>
      <EuiTabs data-test-subj="stream-tabs">{renderTabs()}</EuiTabs>
    </>
  )
}

export default StreamTabs
