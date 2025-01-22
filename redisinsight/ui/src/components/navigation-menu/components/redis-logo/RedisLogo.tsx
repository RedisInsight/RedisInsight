import { EuiIcon, EuiLink, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { getRouterLinkProps } from 'uiSrc/services'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import LogoSVG from 'uiSrc/assets/img/logo_small.svg?react'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import styles from '../../styles.module.scss'

type Props = {
  isRdiWorkspace: boolean
}

export const RedisLogo = ({ isRdiWorkspace }: Props) => {
  const { envDependent } = useSelector(appFeatureFlagsFeaturesSelector)
  const { server } = useSelector(appInfoSelector)

  if (!envDependent?.flag) {
    return (
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <EuiIcon aria-label="Redis Insight Homepage" type={LogoSVG} />
      </span>
    )
  }

  return (
    <EuiToolTip
      content={server?.buildType === BuildType.RedisStack ? 'Edit database' : isRdiWorkspace ? 'Redis Data Integration' : 'Redis Databases'}
      position="right"
    >
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <EuiLink {...getRouterLinkProps(isRdiWorkspace ? Pages.rdi : Pages.home)} className={styles.logo} data-test-subj="home-page-btn" data-testid="redis-logo-link">
          <EuiIcon aria-label="Redis Insight Homepage" type={LogoSVG} />
        </EuiLink>
      </span>
    </EuiToolTip>
  )
}
