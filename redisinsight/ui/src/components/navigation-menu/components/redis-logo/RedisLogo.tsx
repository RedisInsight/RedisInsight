import { EuiIcon, EuiLink, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { getRouterLinkProps } from 'uiSrc/services'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import LogoSVG from 'uiSrc/assets/img/logo_small.svg?react'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import styles from '../../styles.module.scss'

export const RedisLogo = () => {
  const { server } = useSelector(appInfoSelector)
  const { [FeatureFlags.isDesktop]: isDesktop } = useSelector(appFeatureFlagsFeaturesSelector)

  if (!isDesktop?.flag) {
    return (
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <EuiIcon aria-label="redisinsight home page" type={LogoSVG} />
      </span>
    )
  }

  return (
    <EuiToolTip
      content={server?.buildType === BuildType.RedisStack ? 'Edit database' : 'My Redis databases'}
      position="right"
    >
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <EuiLink {...getRouterLinkProps(Pages.home)} className={styles.logo} data-test-subj="home-page-btn">
          <EuiIcon aria-label="redisinsight home page" type={LogoSVG} />
        </EuiLink>
      </span>
    </EuiToolTip>
  )
}
