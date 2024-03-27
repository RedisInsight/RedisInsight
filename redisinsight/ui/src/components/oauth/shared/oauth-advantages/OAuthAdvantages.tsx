import React from 'react'
import { EuiIcon, EuiImage, EuiText, EuiTitle } from '@elastic/eui'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <EuiImage className={styles.logo} src={RedisLogo} alt="" />
    <EuiTitle size="s">
      <h3 className={styles.title}>Get started with Redis Cloud</h3>
    </EuiTitle>
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <EuiText className={styles.advantage} key={title?.toString()}>
          <EuiIcon type="check" className={styles.advantageIcon} />
          <EuiText className={styles.advantageTitle} color="subdued">{title}</EuiText>
        </EuiText>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
