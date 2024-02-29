import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPanel, EuiToolTip } from '@elastic/eui'
import React from 'react'

import SearchRdiList from '../search/SearchRdiList'
import styles from './styles.module.scss'

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
              + RDI INSTANCE
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip
              content="Import RDI Instances"
            >
              <EuiButton
                fill
                color="secondary"
                onClick={() => {}}
                size="s"
                className={styles.importBtn}
                data-testid="import-from-file-btn"
              >
                <EuiIcon type="importAction" />
              </EuiButton>
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiPanel>
)

export default RdiHeader
