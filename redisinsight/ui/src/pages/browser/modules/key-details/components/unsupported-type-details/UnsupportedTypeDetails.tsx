import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import styles from './styles.module.scss'

const UnsupportedTypeDetails = () => (
  <div className={styles.container} data-testid="unsupported-type-details">
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
