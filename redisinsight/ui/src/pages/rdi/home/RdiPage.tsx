import { EuiPage, EuiPageBody, EuiPanel, EuiResizableContainer, EuiResizeObserver } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  createInstanceAction,
  fetchInstancesAction,
  instancesSelector,
  setEditedInstance
} from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import EmptyMessage from './components/EmptyMessage'
import ConnectionForm from '../connection-form/ConnectionForm'
import RdiHeader from '../header/RdiHeader'
import RdiInstancesListWrapper from '../instance-list/RdiInstancesListWrapper'

import styles from './styles.module.scss'

const RdiPage = () => {
  const [width, setWidth] = useState(0)
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false)

  const { data, loading, loadingChanging } = useSelector(instancesSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchInstancesAction())

    return () => {
      dispatch(setEditedInstance(null))
    }
  }, [])

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }

  const handleAddInstance = () => {
    dispatch(
      createInstanceAction({
        name: 'My first integration',
        url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
        version: '1.2',
        username: 'username',
        password: 'password'
      })
    )
    dispatch(fetchInstancesAction())
    dispatch(setEditedInstance(null))
    setIsConnectionFormOpen(false)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_SUBMITTED
    })
  }

  const handleOpenConnectionForm = () => {
    setIsConnectionFormOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CLICKED
    })
  }

  const handleCloseConnectionForm = () => {
    setIsConnectionFormOpen(false)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CANCELLED
    })
  }

  const InstanceList = () =>
    (!data.length ? (
      <EuiPanel className={styles.emptyPanel} borderRadius="none">
        {!loading && !loadingChanging && <EmptyMessage />}
      </EuiPanel>
    ) : (
      <EuiResizeObserver onResize={onResize}>
        {(resizeRef) => (
          <div key="homePage" className="homePage" data-testid="rdi-instance-list" ref={resizeRef}>
            <RdiInstancesListWrapper
              width={width}
              dialogIsOpen={isConnectionFormOpen}
              editedInstance={null}
              onEditInstance={() => {}}
              onDeleteInstances={() => {}}
            />
          </div>
        )}
      </EuiResizeObserver>
    ))

  return (
    <EuiPage className={styles.page}>
      <EuiPageBody component="div">
        <div className={styles.header}>
          <RdiHeader onRdiInstanceClick={handleOpenConnectionForm} />
        </div>
        {isConnectionFormOpen ? (
          <EuiResizableContainer style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel scrollable={false} initialSize={65} id="instances" minSize="50%" paddingSize="none">
                  <InstanceList />
                </EuiResizablePanel>
                <EuiResizableButton style={{ margin: 0 }} />
                <EuiResizablePanel
                  scrollable={false}
                  initialSize={35}
                  id="connection-form"
                  paddingSize="none"
                  minSize="400px"
                >
                  <ConnectionForm onAddInstance={handleAddInstance} onCancel={handleCloseConnectionForm} />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        ) : (
          <InstanceList />
        )}
      </EuiPageBody>
    </EuiPage>
  )
}

export default RdiPage
