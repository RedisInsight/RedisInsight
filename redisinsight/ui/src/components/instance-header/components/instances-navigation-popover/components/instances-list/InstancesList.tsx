import React, { useState } from 'react'
import { EuiListGroup, EuiListGroupItem, EuiLoadingSpinner, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { checkConnectToRdiInstanceAction, instancesSelector as rdiInstancesSelector } from 'uiSrc/slices/rdi/instances'
import { checkConnectToInstanceAction, instancesSelector as dbInstancesSelector, setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import { resetRdiContext, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import { getDbIndex } from 'uiSrc/utils'
import { InstancesTabs } from '../../InstancesNavigationPopover'
import styles from '../../styles.module.scss'

export interface InstancesListProps {
  selectedTab: InstancesTabs
  filteredDbInstances: Instance[]
  filteredRdiInstances: RdiInstance[]
}

const InstancesList = ({
  selectedTab,
  filteredDbInstances,
  filteredRdiInstances,
} :InstancesListProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>('')

  const { instanceId, rdiInstanceId } = useParams<{ instanceId: string, rdiInstanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()
  const { connectedInstance: connectedRdiInstance } = useSelector(rdiInstancesSelector)
  const { connectedInstance: connectedDbInstance } = useSelector(dbInstancesSelector)
  const instances = selectedTab === InstancesTabs.Databases ? filteredDbInstances : filteredRdiInstances

  const connectToInstance = (id = '') => {
    dispatch(resetRdiContext())

    dispatch(setConnectedInstanceId(id))
    setLoading(false)
    history.push(Pages.browser(id))
  }

  const goToInstance = (instance: Instance) => {
    if (connectedDbInstance?.id === instance.id) {
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
    if (connectedRdiInstance?.id === instance.id) {
      // already connected so do nothing
      return
    }
    setLoading(true)
    dispatch(checkConnectToRdiInstanceAction(
      instance.id,
      (id: string) => {
        setLoading(false)

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
