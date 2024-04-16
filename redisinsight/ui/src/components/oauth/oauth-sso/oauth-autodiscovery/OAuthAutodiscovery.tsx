import React, { useState } from 'react'
import { EuiButton, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { find } from 'lodash'
import { OAuthAgreement } from 'uiSrc/components/oauth/shared'
import {
  oauthCloudUserSelector,
  setOAuthCloudSource
} from 'uiSrc/slices/oauth/cloud'
import { fetchSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Pages } from 'uiSrc/constants'
import OAuthSocialButtons from '../../shared/oauth-social-buttons'
import styles from './styles.module.scss'

export interface Props {
  inline?: boolean
  source?: OAuthSocialSource
}

const OAuthAutodiscovery = (props: Props) => {
  const { inline, source = OAuthSocialSource.Autodiscovery } = props
  const { data } = useSelector(oauthCloudUserSelector)

  const [isDiscoverDisabled, setIsDiscoverDisabled] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClickDiscover = () => {
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    setIsDiscoverDisabled(true)
    dispatch(fetchSubscriptionsRedisCloud(
      null,
      true,
      () => {
        history.push(Pages.redisCloudSubscriptions)
        setIsDiscoverDisabled(false)
      },
      () => setIsDiscoverDisabled(false)
    ))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source
      }
    })
  }

  if (data) {
    const { accounts, currentAccountId } = data
    const currentAccountName = find(accounts, ({ id }) => id === currentAccountId)

    return (
      <div
        className={styles.container}
        data-testid="oauth-container-import"
      >
        <EuiText className={styles.text} color="subdued">
          Use
          {' '}
          <strong>{currentAccountName?.name} #{currentAccountId}</strong>
          {' '}
          account to auto-discover subscriptions and add your databases.
        </EuiText>
        <EuiButton
          fill
          color="secondary"
          onClick={handleClickDiscover}
          disabled={isDiscoverDisabled}
          data-testid="oauth-discover-btn"
        >
          Discover
        </EuiButton>
      </div>
    )
  }

  const handleClickSso = (accountOption: string) => {
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    dispatch(setOAuthCloudSource(source))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.Import,
        source
      }
    })
  }

  return (
    <div
      className={styles.container}
      data-testid="oauth-container-import"
    >
      <EuiText className={styles.text} color="subdued">
        Auto-discover subscriptions and add your databases.
        <br />
        A new Redis Cloud account will be created for you if you don’t have one.
      </EuiText>
      <OAuthSocialButtons
        inline={inline}
        className={styles.buttonsContainer}
        onClick={handleClickSso}
        action={OAuthSocialAction.Import}
      />
      <div className={styles.containerAgreement}>
        <OAuthAgreement size="s" />
      </div>
    </div>
  )
}

export default OAuthAutodiscovery
