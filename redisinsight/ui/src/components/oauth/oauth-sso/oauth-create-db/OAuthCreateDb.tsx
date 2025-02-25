import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import {
  createFreeDbJob,
  fetchPlans,
  oauthCloudUserSelector,
  setSocialDialogState,
  showOAuthProgress
} from 'uiSrc/slices/oauth/cloud'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { setIsRecommendedSettingsSSO, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { Nullable } from 'uiSrc/utils'
import OAuthForm from 'uiSrc/components/oauth/shared/oauth-form'
import { OAuthAdvantages, OAuthAgreement, OAuthRecommendedSettings } from '../../shared'
import styles from './styles.module.scss'

export interface Props {
  source?: Nullable<OAuthSocialSource>
}

const OAuthCreateDb = (props: Props) => {
  const { source } = props
  const { data } = useSelector(oauthCloudUserSelector)
  const {
    [FeatureFlags.cloudSsoRecommendedSettings]: isRecommendedFeatureEnabled
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const [isRecommended, setIsRecommended] = useState(isRecommendedFeatureEnabled?.flag ? true : undefined)

  const dispatch = useDispatch()

  const handleSocialButtonClick = (accountOption: string) => {
    dispatch(setIsRecommendedSettingsSSO(isRecommended))
    const cloudRecommendedSettings = !isRecommendedFeatureEnabled?.flag
      ? 'not displayed'
      : (isRecommended ? 'enabled' : 'disabled')

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings,
        source
      }
    })
  }

  const handleChangeRecommendedSettings = (value: boolean) => {
    setIsRecommended(value)
  }

  const handleClickCreate = () => {
    dispatch(setSSOFlow(OAuthSocialAction.Create))
    dispatch(showOAuthProgress(true))
    dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)))
    dispatch(setSocialDialogState(null))

    if (isRecommended) {
      dispatch(createFreeDbJob({
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        resources: {
          isRecommendedSettings: isRecommended
        },
        onFailAction: () => {
          dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
          dispatch(setSSOFlow(undefined))
        }
      }))

      return
    }

    dispatch(fetchPlans())
  }

  return (
    <div className={styles.container} data-testid="oauth-container-create-db">
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem className={styles.advantagesContainer}>
          <OAuthAdvantages />
        </EuiFlexItem>
        <EuiFlexItem className={styles.socialContainer}>
          {!data ? (
            <OAuthForm
              className={styles.socialButtons}
              onClick={handleSocialButtonClick}
              action={OAuthSocialAction.Create}
            >
              {(form: React.ReactNode) => (
                <>
                  <EuiText className={styles.subTitle}>Get started with</EuiText>
                  <EuiTitle className={styles.title}><h2>Free trial Cloud database</h2></EuiTitle>
                  {form}
                  <div>
                    <OAuthRecommendedSettings value={isRecommended} onChange={handleChangeRecommendedSettings} />
                    <OAuthAgreement />
                  </div>
                </>
              )}
            </OAuthForm>
          ) : (
            <>
              <EuiText className={styles.subTitle}>Get your</EuiText>
              <EuiTitle className={styles.title}><h2>Free trial Cloud database</h2></EuiTitle>
              <EuiSpacer size="xl" />
              <EuiText textAlign="center" color="subdued">
                The database will be created automatically and can be changed from Redis Cloud.
              </EuiText>
              <EuiSpacer size="xl" />
              <OAuthRecommendedSettings value={isRecommended} onChange={handleChangeRecommendedSettings} />
              <EuiSpacer />
              <EuiButton
                fill
                color="secondary"
                onClick={handleClickCreate}
                data-testid="oauth-create-db"
              >
                Create
              </EuiButton>
            </>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default OAuthCreateDb
