import {
  EuiFlexItem,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'

import { LENGTH_NAMING_BY_TYPE, MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { initialKeyInfo, selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { formatBytes } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  width: number
}

const KeyDetailsHeaderSizeLength = ({
  width,
}: Props) => {
  const {
    type,
    size,
    length,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo

  return (
    <>
      {size && (
        <EuiFlexItem grow={false}>
          <EuiText
            grow
            color="subdued"
            size="s"
            className={styles.subtitleText}
            data-testid="key-size-text"
          >
            <EuiToolTip
              title="Key Size"
              position="left"
              content={(
                <>
                  {formatBytes(size, 3)}
                </>
            )}
            >
              <>
                {width > MIDDLE_SCREEN_RESOLUTION && 'Key Size: '}
                {formatBytes(size, 0)}
              </>
            </EuiToolTip>
          </EuiText>
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false}>
        <EuiText
          grow
          color="subdued"
          size="s"
          className={styles.subtitleText}
          data-testid="key-length-text"
        >
          {LENGTH_NAMING_BY_TYPE[type] ?? 'Length'}
          {': '}
          {length ?? '-'}
        </EuiText>
      </EuiFlexItem>
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
