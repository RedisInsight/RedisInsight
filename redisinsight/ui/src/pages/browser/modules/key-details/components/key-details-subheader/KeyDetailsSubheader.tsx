import React from 'react'

import { EuiButton, EuiCheckbox, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'

import Divider from 'uiSrc/components/divider/Divider'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

interface Props {
  showTtl: boolean
  onShowTtl: (checked: boolean) => void
  onAddKey: () => void
  isExpireFieldsAvailable?: boolean
}

export const KeyDetailsSubheader = ({
  showTtl,
  onShowTtl,
  onAddKey,
  isExpireFieldsAvailable
}: Props) => (
  <div className={styles.subheaderContainer}>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <EuiFlexGroup justifyContent="flexEnd" gutterSize="none">
            <EuiFlexItem className={styles.keyFormatterItem}>
              <KeyDetailsHeaderFormatter width={width} />
            </EuiFlexItem>
            <Divider
              variant="half"
              className={styles.divider}
              colorVariable="separatorColor"
              orientation="vertical"
            />
            {isExpireFieldsAvailable && (
              <>
                <EuiFlexItem className={styles.showTtlItem} grow={false}>
                  <EuiCheckbox
                    id="showField"
                    name="showTtl"
                    label="Show TTL"
                    className={styles.showTtlCheckbox}
                    checked={showTtl}
                    onChange={(e) => onShowTtl(e.target.checked)}
                    data-testId="test-check-ttl"
                  />
                </EuiFlexItem>
                <Divider
                  variant="half"
                  className={styles.divider}
                  colorVariable="separatorColor"
                  orientation="vertical"
                />
              </>
            )}
            <EuiFlexItem className={styles.addBtnContainer} grow={false}>
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
