import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'

import styles from './styles.module.scss'

const UnsupportedTypeDetails = () => (
  <div className={styles.container} data-testid="unsupported-type-details">
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem className={styles.textWrapper}>
        <EuiTitle>
          <h4>This data type is coming soon!</h4>
        </EuiTitle>
        <EuiText size="s">
          We are constantly working to launch support for more data types.
          If you have any ideas or suggestions, please
          {' '}
          <a
            href="https://github.com/RedisInsight/RedisInsight/issues"
            className={styles.link}
            target="_blank"
            rel="noreferrer"
          >
            contact us
          </a>
          .
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default UnsupportedTypeDetails
