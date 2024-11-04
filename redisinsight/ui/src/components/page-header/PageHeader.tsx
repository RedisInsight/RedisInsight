import React from 'react'
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import cx from 'classnames'
import { Pages, FeatureFlags } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import Logo from 'uiSrc/assets/img/logo.svg?react'

import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
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

  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([databaseChatFeature, documentationChatFeature])

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
            {isAnyChatAvailable && (
              <EuiFlexItem grow={false} style={{ marginRight: 12 }}>
                <CopilotTrigger />
              </EuiFlexItem>
            )}
            <EuiFlexItem><InsightsTrigger source="home page" /></EuiFlexItem>
            <FeatureFlagComponent name={FeatureFlags.cloudSso}>
              <EuiFlexItem style={{ marginLeft: 16 }} data-testid="o-auth-user-profile">
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
