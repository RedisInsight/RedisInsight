import React, { useState } from 'react'
import { EuiListGroup, EuiListGroupItem, EuiLoadingSpinner, EuiText } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { checkConnectToRdiInstanceAction } from 'uiSrc/slices/rdi/instances'
import { checkConnectToInstanceAction, setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import { getDbIndex } from 'uiSrc/utils'
import { InstancesTabs } from '../../InstancesNavigationPopover'
import styles from '../../styles.module.scss'

export interface InstancesListProps {
  selectedTab: InstancesTabs
  filteredDbInstances: Instance[]
  filteredRdiInstances: RdiInstance[]
  onItemClick: () => void
}

const InstancesList = ({
  selectedTab,
  filteredDbInstances,
  filteredRdiInstances,
  onItemClick,
} :InstancesListProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>('')

  const { instanceId, rdiInstanceId } = useParams<{ instanceId: string, rdiInstanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()
  const instances = selectedTab === InstancesTabs.Databases ? filteredDbInstances : filteredRdiInstances

  const connectToInstance = (id = '') => {
    dispatch(setConnectedInstanceId(id))
    setLoading(false)
    onItemClick?.()
    history.push(Pages.browser(id))
  }

  const goToInstance = (instance: Instance) => {
    if (instanceId === instance.id) {
      // already connected so do nothing
      return
    }
    setLoading(true)
    const modulesSummary = getRedisModulesSummary(instance.modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: instance.id,
        source: 'navigation_panel',
        provider: instance.provider,
        ...modulesSummary,
      }
    })
    dispatch(checkConnectToInstanceAction(instance.id, connectToInstance, () => setLoading(false), false))
  }

  const goToRdiInstance = (instance: RdiInstance) => {
    if (rdiInstanceId === instance.id) {
      // already connected so do nothing
      return
    }
    setLoading(true)
    dispatch(checkConnectToRdiInstanceAction(
      instance.id,
      (id: string) => {
        setLoading(false)
        onItemClick?.()
        history.push(Pages.rdiPipelineConfig(id))
      },
      () => setLoading(false)
    ))
  }

  const goToPage = (instance: Instance | RdiInstance) => {
    if (selectedTab === InstancesTabs.Databases) {
      goToInstance(instance as Instance)
    } else {
      goToRdiInstance(instance as RdiInstance)
    }
  }

  const isInstanceActive = (id: string) => {
    if (selectedTab === InstancesTabs.Databases) {
      return id === instanceId
    }
    return id === rdiInstanceId
  }

  if (!instances?.length) {
    const emptyMsg = selectedTab === InstancesTabs.Databases ? 'No databases' : 'No RDI endpoints'
    return (
      <div className={styles.emptyMsg}>{emptyMsg}</div>
    )
  }

  return (
    <div className={styles.listContainer}>
      <EuiListGroup flush maxWidth="none" gutterSize="none">
        {instances?.map((instance) => (
          <EuiListGroupItem
            className={styles.item}
            isActive={isInstanceActive(instance.id)}
            disabled={loading}
            key={instance.id}
            label={(
              <EuiText style={{ display: 'flex', alignItems: 'center' }}>
                {loading && instance?.id === selected && (
                <EuiLoadingSpinner
                  size="s"
                  className={styles.loading}
                />
                )}
                {instance.name}
                {' '}
                {getDbIndex(instance.db)}
              </EuiText>
        )}
            onClick={() => {
              setSelected(instance.id)
              goToPage(instance)
            }}
            data-testid={`instance-item-${instance.id}`}
          />
        ))}
      </EuiListGroup>
    </div>
  )
}

export default InstancesList
