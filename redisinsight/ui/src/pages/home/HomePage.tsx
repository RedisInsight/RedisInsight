import { EuiPage, EuiPageBody, EuiResizableContainer, EuiResizeObserver } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { optimizeLSInstances, setTitle } from 'uiSrc/utils'
import { PageHeader } from 'uiSrc/components'
import { BrowserStorageItem } from 'uiSrc/constants'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { Instance } from 'uiSrc/slices/interfaces'
import { cloudSelector, resetSubscriptionsRedisCloud } from 'uiSrc/slices/instances/cloud'
import { editedInstanceSelector, fetchEditedInstanceAction, fetchInstancesAction, instancesSelector, setEditedInstance } from 'uiSrc/slices/instances/instances'
import { localStorageService } from 'uiSrc/services'
import { resetDataSentinel, sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { fetchContentAction as fetchCreateRedisButtonsAction } from 'uiSrc/slices/content/create-redis-buttons'
import { sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'
import AddDatabaseContainer from './components/AddDatabases/AddDatabasesContainer'
import DatabasesList from './components/DatabasesListComponent/DatabasesListWrapper'
import WelcomeComponent from './components/WelcomeComponent/WelcomeComponent'
import HomeHeader from './components/HomeHeader'

import './styles.scss'
import styles from './styles.module.scss'

const HomePage = () => {
  const [width, setWidth] = useState(0)
  const [addDialogIsOpen, setAddDialogIsOpen] = useState(false)
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [welcomeIsShow, setWelcomeIsShow] = useState(
    !localStorageService.get(BrowserStorageItem.instancesCount)
  )
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const dispatch = useDispatch()

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { instance: sentinelInstance } = useSelector(sentinelSelector)

  const {
    loading,
    data: instances,
    changedSuccessfully: isChangedInstance,
    deletedSuccessfully: isDeletedInstance,
  } = useSelector(instancesSelector)

  const {
    data: editedInstance,
  } = useSelector(editedInstanceSelector)

  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)

  const { contextInstanceId } = useSelector(appContextSelector)

  !welcomeIsShow && setTitle('My Redis databases')

  useEffect(() => {
    dispatch(fetchInstancesAction())
    dispatch(resetInstancesRedisCluster())
    dispatch(resetSubscriptionsRedisCloud())
    dispatch(fetchCreateRedisButtonsAction())

    return (() => {
      dispatch(setEditedInstance(null))
    })
  }, [])

  useEffect(() => {
    if (isDeletedInstance) {
      dispatch(fetchInstancesAction())
    }
  }, [isDeletedInstance])

  useEffect(() => {
    if (isChangedInstance) {
      setAddDialogIsOpen(!isChangedInstance)
      setEditDialogIsOpen(!isChangedInstance)
      dispatch(setEditedInstance(null))
      // send page view after adding database from welcome page
      sendPageViewTelemetry({
        name: TelemetryPageView.DATABASES_LIST_PAGE
      })
    }
  }, [isChangedInstance])

  useEffect(() => {
    if (!isPageViewSent && !isChangedInstance && instances.length && analyticsIdentified) {
      setIsPageViewSent(true)
      sendPageViewTelemetry({
        name: TelemetryPageView.DATABASES_LIST_PAGE
      })
    }
    if (instances.length && !isPageViewSent) {
      optimizeLSInstances(instances)
    }
  }, [instances, analyticsIdentified, isPageViewSent, isChangedInstance])

  useEffect(() => {
    if (clusterCredentials || cloudCredentials || sentinelInstance) {
      setAddDialogIsOpen(true)
    }
  }, [clusterCredentials, cloudCredentials, sentinelInstance])

  useEffect(() => {
    const isDialogOpen = !!instances.length && (addDialogIsOpen || editDialogIsOpen)

    const instancesCashCount = JSON.parse(
      localStorageService.get(BrowserStorageItem.instancesCount) ?? '0'
    )

    const isShowWelcome = !instances.length && !addDialogIsOpen && !editDialogIsOpen && !instancesCashCount

    setDialogIsOpen(isDialogOpen)

    setWelcomeIsShow(isShowWelcome)
  }, [addDialogIsOpen, editDialogIsOpen, instances, loading])

  useEffect(() => {
    if (editedInstance) {
      const found = instances.find((item: Instance) => item.id === editedInstance.id)
      if (found) {
        dispatch(fetchEditedInstanceAction(found))
      }
    }
  }, [instances])

  const onDbEdited = () => {
    if (contextInstanceId && contextInstanceId === editedInstance?.id) {
      dispatch(resetKeys())
      dispatch(resetRedisearchKeysData())
      dispatch(resetCliSettingsAction())
      dispatch(resetCliHelperSettings())
      dispatch(setAppContextInitialState())
    }
  }

  const closeEditDialog = () => {
    dispatch(setEditedInstance(null))
    setEditDialogIsOpen(false)

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CANCELLED_CLICKED,
      eventData: {
        databaseId: editedInstance?.id
      }
    })
  }

  const handleClose = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataSentinel())

    setAddDialogIsOpen(false)
    dispatch(setEditedInstance(null))
    setEditDialogIsOpen(false)

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_ADD_FORM_DISMISSED
    })
  }

  const handleAddInstance = () => {
    setAddDialogIsOpen(true)
    dispatch(setEditedInstance(null))
    setEditDialogIsOpen(false)
  }

  const handleEditInstance = (editedInstance: Instance) => {
    if (editedInstance) {
      dispatch(fetchEditedInstanceAction(editedInstance))
      setEditDialogIsOpen(true)
      setAddDialogIsOpen(false)
    }
  }
  const handleDeleteInstances = (instances: Instance[]) => {
    if (instances.find((instance) => instance.id === editedInstance?.id)) {
      dispatch(setEditedInstance(null))
      setEditDialogIsOpen(false)
    }

    instances.forEach((instance) => {
      localStorageService.remove(BrowserStorageItem.dbConfig + instance.id)
    })
  }

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }

  if (welcomeIsShow) {
    return (
      <WelcomeComponent onAddInstance={handleAddInstance} />
    )
  }

  return (
    <>
      <PageHeader title="My Redis databases" />
      <div />
      <EuiResizeObserver onResize={onResize}>
        {(resizeRef) => (
          <EuiPage className={styles.page}>
            <EuiPageBody component="div">
              <HomeHeader
                key="instance-controls"
                onAddInstance={handleAddInstance}
                direction="row"
                welcomePage={!instances.length}
              />
              {dialogIsOpen ? (
                <div key="homePage" className="homePage">
                  <EuiResizableContainer style={{ height: '100%' }}>
                    {(EuiResizablePanel, EuiResizableButton) => (
                      <>
                        <EuiResizablePanel
                          scrollable={false}
                          initialSize={62}
                          id="databases"
                          minSize="50%"
                          paddingSize="none"
                        >
                          <div ref={resizeRef}>
                            <DatabasesList
                              width={width}
                              dialogIsOpen={dialogIsOpen}
                              editedInstance={editedInstance}
                              onEditInstance={handleEditInstance}
                              onDeleteInstances={handleDeleteInstances}
                            />
                          </div>
                        </EuiResizablePanel>

                        <EuiResizableButton style={{ margin: 0 }} />

                        <EuiResizablePanel
                          scrollable={false}
                          initialSize={38}
                          className={cx({
                            [styles.contentActive]: editDialogIsOpen,
                          })}
                          id="form"
                          paddingSize="none"
                          style={{ minWidth: '494px' }}
                        >
                          {editDialogIsOpen && (
                            <AddDatabaseContainer
                              editMode
                              width={width}
                              isResizablePanel
                              editedInstance={editedInstance}
                              onClose={closeEditDialog}
                              onDbEdited={onDbEdited}
                            />
                          )}

                          {addDialogIsOpen && (
                            <AddDatabaseContainer
                              editMode={false}
                              width={width}
                              isResizablePanel
                              editedInstance={sentinelInstance ?? null}
                              onClose={handleClose}
                              isFullWidth={!instances.length}
                            />
                          )}
                          <div id="footerDatabaseForm" />
                        </EuiResizablePanel>
                      </>
                    )}
                  </EuiResizableContainer>
                </div>
              ) : (
                <div key="homePage" className="homePage" ref={resizeRef}>
                  {!!instances.length || loading ? (
                    <DatabasesList
                      width={width}
                      editedInstance={editedInstance}
                      dialogIsOpen={dialogIsOpen}
                      onEditInstance={handleEditInstance}
                      onDeleteInstances={handleDeleteInstances}
                    />
                  ) : (
                    <>
                      {addDialogIsOpen && (
                        <AddDatabaseContainer
                          editMode={false}
                          width={width}
                          isResizablePanel
                          editedInstance={sentinelInstance ?? null}
                          onClose={handleClose}
                          isFullWidth={!instances.length}
                        />
                      )}
                      <div id="footerDatabaseForm" />
                    </>
                  )}
                </div>
              )}
            </EuiPageBody>
          </EuiPage>
        )}
      </EuiResizeObserver>
    </>
  )
}

export default HomePage
