import React from 'react'

import { EuiButton, EuiCheckbox, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'

import VerticalDivider from 'uiSrc/pages/rdi/statistics/components/vertical-divider'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

interface Props {
  showTtl: boolean
  onShowTtl: (checked: boolean) => void
  onAddKey: () => void
}

export const KeyDetailsSubheader = ({
  showTtl,
  onShowTtl,
  onAddKey
}: Props) => (
  <div className={styles.subheaderContainer}>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem className={styles.keyFormatter__item}>
              <KeyDetailsHeaderFormatter width={width} />
            </EuiFlexItem>
            <VerticalDivider variant="half" />
            <EuiFlexItem className={styles.showTtl__item}>
              <EuiCheckbox
                id="showField"
                name="showTtl"
                label="Show TTL"
                className={styles.showTtl__checkbox}
                checked={showTtl}
                onChange={(e) => onShowTtl(e.target.checked)}
                data-testId="test-check-ttl"
              />
            </EuiFlexItem>
            <VerticalDivider variant="half" />
            <EuiFlexItem className={styles.addBtn__container}>
              <EuiButton
                fill
                color="secondary"
                onClick={onAddKey}
                data-testid="btn-add-key"
              >
                +
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )}
    </AutoSizer>
  </div>
)

export default KeyDetailsSubheader
