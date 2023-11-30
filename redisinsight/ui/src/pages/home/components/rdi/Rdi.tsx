import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchInstancesAction, setEditedInstance, createInstancesAction } from 'uiSrc/slices/rdi/instances'
import RdiHeader from '../rdi-header/RdiHeader'
import RdiInstancesListWrapper from '../item-list-component/RdiInstancesListWrapper'

export interface Props {
  resizeRef: (e: HTMLElement | null) => void
  width: number
}

const Rdi = ({ resizeRef, width }: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchInstancesAction())

    return () => {
      dispatch(setEditedInstance(null))
    }
  }, [])

  const handleAddInstance = () => {
    dispatch(createInstancesAction())
    dispatch(setEditedInstance(null))
  }

  return (
    <>
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
    </>
  )
}

export default Rdi
