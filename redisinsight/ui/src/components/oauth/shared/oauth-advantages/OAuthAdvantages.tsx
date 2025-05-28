import React from 'react'
import { EuiIcon, EuiImage, EuiText } from '@elastic/eui'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { Title } from 'uiSrc/components/base/text/Title'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <EuiImage className={styles.logo} src={RedisLogo} alt="" />
    <Title size="S" className={styles.title}>
      Cloud
    </Title>
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <EuiText className={styles.advantage} key={title?.toString()}>
          <EuiIcon type="check" className={styles.advantageIcon} />
          <EuiText className={styles.advantageTitle} color="subdued">
            {title}
          </EuiText>
        </EuiText>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
