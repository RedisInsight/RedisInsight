import React from 'react'
import { useSelector } from 'react-redux'
import { EuiButton } from '@elastic/eui'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { HomePageHeader } from 'uiSrc/components'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  const AddInstanceBtn = () => (
    <>
      <EuiButton
        fill
        color="secondary"
        onClick={onRdiInstanceClick}
        data-testid="rdi-instance"
      >
        + RDI Instance
      </EuiButton>
    </>
  )

  return (

    <HomePageHeader
      addBtn={<AddInstanceBtn />}
      searchComponent={instances.length ? <SearchRdiList /> : undefined}
    />
  )
}

export default RdiHeader
