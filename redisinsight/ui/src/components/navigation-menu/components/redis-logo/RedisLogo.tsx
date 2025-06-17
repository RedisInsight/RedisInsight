import { EuiLink, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { getRouterLinkProps } from 'uiSrc/services'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
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
        <RiIcon aria-label="Redis Insight Homepage" type="RedisLogo" />
      </span>
    )
  }

  return (
    <EuiToolTip
      content={
        server?.buildType === BuildType.RedisStack
          ? 'Edit database'
          : isRdiWorkspace
            ? 'Redis Data Integration'
            : 'Redis Databases'
      }
      position="right"
    >
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <EuiLink
          {...getRouterLinkProps(isRdiWorkspace ? Pages.rdi : Pages.home)}
          className={styles.logo}
          data-test-subj="home-page-btn"
          data-testid="redis-logo-link"
        >
          <RiIcon
            aria-label="Redis Insight Homepage"
            type="RedisLogo"
            size="XL"
          />
        </EuiLink>
      </span>
    </EuiToolTip>
  )
}
