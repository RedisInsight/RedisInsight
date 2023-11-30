import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui'
import SearchRdiList from '../search-rdi-list/SearchRdiList'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
}

const RdiHeader = ({ onAddInstance }: Props) => (
  <div className={styles.containerDl}>
    <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false}>
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="flexStart" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h1>My RDI instances</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem className={styles.searchContainer}>
            <SearchRdiList />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="flexEnd" alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton fill size="s" color="secondary" onClick={onAddInstance} data-testid="add-rdi-instance">
              RDI instance
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
    <EuiSpacer className={styles.spacerDl} />
  </div>
)

export default RdiHeader
