import { EuiPage, EuiPageBody, EuiResizeObserver } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  createInstancesAction,
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

  const { data } = useSelector(instancesSelector)

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
    dispatch(createInstancesAction())
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
                <EmptyMessage />
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
