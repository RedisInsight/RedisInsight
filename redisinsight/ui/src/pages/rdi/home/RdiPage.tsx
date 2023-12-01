import { EuiPage, EuiPageBody, EuiResizeObserver } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { createInstancesAction, fetchInstancesAction, setEditedInstance } from 'uiSrc/slices/rdi/instances'
import RdiInstancesListWrapper from '../../home/components/item-list-component/RdiInstancesListWrapper'
import RdiHeader from '../../home/components/rdi-header/RdiHeader'

import styles from '../../home/styles.module.scss'

export interface Props {

}

const RdiPage = () => {
  const [width, setWidth] = useState(0)

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
              <RdiHeader onAddInstance={handleAddInstance} />
              <div key="homePage" className="homePage" ref={resizeRef}>
                <RdiInstancesListWrapper
                  width={width}
                  dialogIsOpen={false}
                  editedInstance={null}
                  onEditInstance={() => {}}
                  onDeleteInstances={() => {}}
                />
              </div>
            </div>
          </EuiPageBody>
        </EuiPage>
      )}
    </EuiResizeObserver>
  )
}

export default RdiPage
