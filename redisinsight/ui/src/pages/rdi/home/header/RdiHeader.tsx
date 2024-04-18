import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  return (
    <div className="containerDl">
      <EuiFlexGroup className="contentDL" alignItems="center" responsive={false} gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiButton fill color="secondary" onClick={onRdiInstanceClick} data-testid="rdi-instance">
            <span className={cx('eui-showFor--s', 'eui-showFor--xs')}>+ RDI INSTANCE</span>
            <span className={cx('eui-hideFor--s', 'eui-hideFor--xs')}>+ Add RDI Instance</span>
          </EuiButton>
        </EuiFlexItem>
        {instances.length > 0 && (
          <EuiFlexItem grow={false} className="searchContainer">
            <SearchRdiList />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiSpacer className="spacerDl" />
    </div>
  )
}

export default RdiHeader
