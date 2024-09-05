import React, { ReactElement } from 'react'

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'

import { isUndefined } from 'lodash'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  Actions?: (props: { width: number }) => ReactElement
}

export const KeyDetailsSubheader = ({
  keyType,
  Actions,
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
            {!isUndefined(Actions) && <Actions width={width} />}
          </EuiFlexGroup>
        </div>
      )}
    </AutoSizer>
  </div>
)

export default KeyDetailsSubheader
