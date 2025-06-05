import React from 'react'
import { EuiIcon, EuiImage, EuiTitle } from '@elastic/eui'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { Text } from 'uiSrc/components/base/text'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <EuiImage className={styles.logo} src={RedisLogo} alt="" />
    <EuiTitle size="s">
      <h3 className={styles.title}>Cloud</h3>
    </EuiTitle>
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <Text
          component="div"
          className={styles.advantage}
          key={title?.toString()}
        >
          <EuiIcon type="check" className={styles.advantageIcon} />
          <Text className={styles.advantageTitle} color="subdued">
            {title}
          </Text>
        </Text>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
