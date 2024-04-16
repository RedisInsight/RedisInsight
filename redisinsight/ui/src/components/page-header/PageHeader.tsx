import React from 'react'
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import cx from 'classnames'
import { Pages, FeatureFlags } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { ReactComponent as Logo } from 'uiSrc/assets/img/logo.svg'

import InsightsTrigger from 'uiSrc/components/insights-trigger'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import styles from './PageHeader.module.scss'

interface Props {
  title: string
  subtitle?: string
  children?: React.ReactNode
  showInsights?: boolean
  className?: string
}

const PageHeader = (props: Props) => {
  const { title, subtitle, showInsights, children, className } = props
  const history = useHistory()
  const dispatch = useDispatch()

  const resetConnections = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataRedisCloud())
    dispatch(resetDataSentinel())
  }

  const goHome = () => {
    resetConnections()
    history.push(Pages.home)
  }

  return (
    <div className={cx(styles.pageHeader, className)}>
      <div className={styles.pageHeaderTop}>
        <div>
          <EuiTitle size="s" className={styles.title} data-testid="page-title">
            <h1>
              <b data-testid="page-header-title">{title}</b>
            </h1>
          </EuiTitle>
          {subtitle ? <span data-testid="page-subtitle">{subtitle}</span> : ''}
        </div>
        {children ? <>{children}</> : ''}
        {showInsights ? (
          <EuiFlexGroup style={{ flexGrow: 0 }} gutterSize="none" alignItems="center">
            <EuiFlexItem><InsightsTrigger source="home page" /></EuiFlexItem>
            <FeatureFlagComponent name={FeatureFlags.cloudSso}>
              <EuiFlexItem style={{ marginLeft: 16 }}>
                <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
              </EuiFlexItem>
            </FeatureFlagComponent>
          </EuiFlexGroup>
        ) : (
          <div className={styles.pageHeaderLogo}>
            <EuiButtonEmpty
              aria-label="redisinsight"
              onClick={goHome}
              onKeyDown={goHome}
              className={styles.logo}
              tabIndex={0}
              iconType={Logo}
              data-testid="redis-logo-home"
            />
          </div>
        )}
      </div>
    </div>
  )
}

PageHeader.defaultProps = {
  subtitle: null,
  children: null,
}

export default PageHeader
