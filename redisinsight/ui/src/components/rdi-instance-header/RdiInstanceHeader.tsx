import React from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiToolTip
} from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import InstancesNavigationPopover from '../instance-header/components/instances-navigation-popover'
import styles from './styles.module.scss'

const RdiInstanceHeader = () => {
  const { name = '' } = useSelector(connectedInstanceSelector)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([databaseChatFeature, documentationChatFeature])
  const history = useHistory()

  const goHome = () => {
    history.push(Pages.rdi)
  }

  return (
    <EuiFlexGroup className={styles.container} gutterSize="none" alignItems="center" responsive={false}>
      <EuiFlexItem style={{ overflow: 'hidden' }}>
        <div className={styles.breadcrumbsContainer} data-testid="breadcrumbs-container">
          <div>
            <EuiToolTip
              position="bottom"
              content="My RDI instances"
            >
              <EuiText
                className={styles.breadCrumbLink}
                aria-label="My RDI instances"
                data-testid="my-rdi-instances-btn"
                onClick={goHome}
                onKeyDown={goHome}
              >
                RDI instances
              </EuiText>
            </EuiToolTip>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ maxWidth: '100%' }}>
              <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiText className={styles.divider}>&#62;</EuiText>
                </EuiFlexItem>
                <EuiFlexItem style={{ overflow: 'hidden' }}>
                  <InstancesNavigationPopover name={name} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          </div>
        </div>
      </EuiFlexItem>

      {isAnyChatAvailable && (
        <EuiFlexItem grow={false} style={{ marginRight: 12 }}>
          <CopilotTrigger />
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false} style={{ marginLeft: 12 }}>
        <InsightsTrigger />
      </EuiFlexItem>

      <FeatureFlagComponent name={FeatureFlags.cloudSso}>
        <EuiFlexItem grow={false} style={{ marginLeft: 16 }} data-testid="o-auth-user-profile-rdi">
          <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
        </EuiFlexItem>
      </FeatureFlagComponent>
    </EuiFlexGroup>
  )
}

export default RdiInstanceHeader
