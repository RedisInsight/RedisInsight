import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui'
import React from 'react'

import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => (
  <EuiPanel>
    <EuiFlexGroup responsive={false}>
      <EuiFlexItem>
        <SearchRdiList />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="flexEnd" alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton fill size="s" color="secondary" onClick={onRdiInstanceClick} data-testid="rdi-instance">
              RDI Instance
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" onClick={() => {}} data-testid="import-rdi-instance">
              Import
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiPanel>
)

export default RdiHeader
