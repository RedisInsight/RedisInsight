import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import LogoSVG from 'uiSrc/assets/img/logo_small.svg?react'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import { getRouterLinkProps } from 'uiSrc/services'
import { Pages } from 'uiSrc/constants'
import { Link } from 'uiSrc/components/base/link/Link'
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
        <SideBarItemIcon aria-label="Redis Insight Homepage" icon={LogoSVG} />
      </span>
    )
  }

  return (
    <Link
      {...getRouterLinkProps(isRdiWorkspace ? Pages.rdi : Pages.home)}
      data-testid="redis-logo-link"
      style={{ backgroundColor: 'transparent' }}
    >
      <SideBarItem
        tooltipProps={{
          text:
            server?.buildType === BuildType.RedisStack
              ? 'Edit database'
              : isRdiWorkspace
                ? 'Redis Data Integration'
                : 'Redis Databases',
          placement: 'right',
        }}
        style={{ marginBlock: '2rem', marginInline: 'auto' }}
      >
        <SideBarItemIcon icon={LogoSVG} />
      </SideBarItem>
    </Link>
  )
}
