import { EuiPage, EuiPageBody, EuiPanel, EuiResizeObserver } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  createInstanceAction,
  fetchInstancesAction,
  instancesSelector,
  setEditedInstance
} from 'uiSrc/slices/rdi/instances'
import EmptyMessage from './components/EmptyMessage'
import RdiHeader from '../header/RdiHeader'
import RdiInstancesListWrapper from '../instance-list/RdiInstancesListWrapper'

import styles from './styles.module.scss'

export interface Props {}

const RdiPage = () => {
  const [width, setWidth] = useState(0)

  const { data, loading } = useSelector(instancesSelector)

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
    dispatch(createInstanceAction({
      name: 'My third integration',
      url: 'redis-11121.c253.us-central1-1.gce.cloud.redislabs.com:11121',
      lastConnection: new Date(),
      version: '1.2',
      username: 'username',
      password: 'password',
    }))
    dispatch(fetchInstancesAction())
    dispatch(setEditedInstance(null))
  }

  return (
    <EuiResizeObserver onResize={onResize}>
      {(resizeRef) => (
        <EuiPage className={styles.page}>
          <EuiPageBody component="div">
            <div ref={resizeRef}>
              <div className={styles.header}>
                <RdiHeader onAddInstance={handleAddInstance} />
              </div>
              {!data.length ? (
                <EuiPanel className={styles.emptyPanel} borderRadius="none">
                  {!loading && <EmptyMessage />}
                </EuiPanel>
              ) : (
                <div key="homePage" className="homePage" data-testid="rdi-instance-list" ref={resizeRef}>
                  <RdiInstancesListWrapper
                    width={width}
                    dialogIsOpen={false}
                    editedInstance={null}
                    onEditInstance={() => {}}
                    onDeleteInstances={() => {}}
                  />
                </div>
              )}
            </div>
          </EuiPageBody>
        </EuiPage>
      )}
    </EuiResizeObserver>
  )
}

export default RdiPage
