import React from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle, EuiToolTip } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

const UnsupportedTypeDetails = ({ onClose }: 
      { onClose: (key: RedisResponseBuffer) => void }) => (
  <div className={styles.container} data-testid="unsupported-type-details">
    <EuiToolTip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
    >
      <EuiButtonIcon
          iconType="cross"
          color="primary"
          aria-label="Close key"
          className={styles.closeBtn}
          onClick={() => onClose(undefined)}
          data-testid="unsuported-type-close-key-btn"
      />
    </EuiToolTip>
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem className={styles.textWrapper}>
        <EuiTitle>
          <h4>This key type is not currently supported.</h4>
        </EuiTitle>
        <EuiText size="s">
          See{' '}
          <a
            href={EXTERNAL_LINKS.githubRepo}
            className={styles.link}
            target="_blank"
            rel="noreferrer"
          >
            our repository
          </a>
          {' '}for the list of supported key types.
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default UnsupportedTypeDetails
