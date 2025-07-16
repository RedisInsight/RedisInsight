import React from 'react'
import { EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import cx from 'classnames'
import { Pages, FeatureFlags } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from './PageHeader.module.scss'

interface Props {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

const PageHeader = (props: Props) => {
  const { title, subtitle, children, className } = props

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
        
          <Row style={{ flexGrow: 0 }} align="center">
            <FlexItem style={{ marginRight: 12 }}>
              <CopilotTrigger />
            </FlexItem>
            <FlexItem grow>
              <InsightsTrigger source="home page" />
            </FlexItem>
            <FeatureFlagComponent
              name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
            >
              <FlexItem
                grow
                style={{ marginLeft: 16 }}
                data-testid="o-auth-user-profile"
              >
                <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
              </FlexItem>
            </FeatureFlagComponent>
          </Row>
       
      </div>
    </div>
  )
}

PageHeader.defaultProps = {
  subtitle: null,
  children: null,
}

export default PageHeader
