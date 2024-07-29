import React, { ReactElement } from 'react'

import { EuiCheckbox, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'

import { isUndefined } from 'lodash'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  showTtl?: boolean
  onShowTtl?: (checked: boolean) => void
  Actions?: (props: { width: number }) => ReactElement
  isExpireFieldsAvailable?: boolean
}

export const KeyDetailsSubheader = ({
  showTtl,
  onShowTtl,
  keyType,
  Actions,
  isExpireFieldsAvailable
}: Props) => (
  <div className={styles.subheaderContainer}>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <EuiFlexGroup justifyContent="flexEnd" alignItems="center" gutterSize="none">
            {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
              <>
                <EuiFlexItem className={styles.keyFormatterItem} grow={false}>
                  <KeyDetailsHeaderFormatter width={width} />
                </EuiFlexItem>
                <Divider
                  className={styles.divider}
                  colorVariable="separatorColor"
                  orientation="vertical"
                />
              </>
            )}
            {isExpireFieldsAvailable && (
            <>
              <EuiFlexItem className={styles.showTtlItem} grow={false}>
                <EuiCheckbox
                  id="showField"
                  name="showTtl"
                  label="Show TTL"
                  className={styles.showTtlCheckbox}
                  checked={showTtl}
                  onChange={(e) => onShowTtl && onShowTtl(e.target.checked)}
                  data-testId="test-check-ttl"
                />
              </EuiFlexItem>
              <Divider
                className={styles.divider}
                colorVariable="separatorColor"
                orientation="vertical"
              />
            </>
            )}

            {!isUndefined(Actions) && <Actions width={width} />}
          </EuiFlexGroup>
        </div>
      )}
    </AutoSizer>
  </div>
)

export default KeyDetailsSubheader
