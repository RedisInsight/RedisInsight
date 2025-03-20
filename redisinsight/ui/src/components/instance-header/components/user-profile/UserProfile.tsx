import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { EuiIcon, EuiLink, EuiLoadingSpinner, EuiPopover, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import {
  logoutUserAction,
} from 'uiSrc/slices/oauth/cloud'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud.svg?react'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { getTruncatedName, Nullable } from 'uiSrc/utils'
import { fetchSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { getConfig } from 'uiSrc/config'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import styles from './styles.module.scss'

export interface Props {
  error: Nullable<string>;
  data: Nullable<CloudUser>;
  handleClickSelectAccount?: (id: number) => void;
  handleClickCloudAccount?: () => void;
  selectingAccountId?: number;
}

const riConfig = getConfig()

const UserProfile = (props: Props) => {
  const {
    error,
    data,
    handleClickSelectAccount,
    handleClickCloudAccount,
    selectingAccountId
  } = props

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isImportLoading, setIsImportLoading] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  if (!data || error) {
    return null
  }

  const handleClickImport = () => {
    if (isImportLoading) return

    setIsImportLoading(true)
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    dispatch(fetchSubscriptionsRedisCloud(
      null,
      true,
      () => {
        history.push(Pages.redisCloudSubscriptions)
        setIsImportLoading(false)
      },
      () => setIsImportLoading(false)
    ))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: OAuthSocialSource.UserProfile
      }
    })
  }

  const handleClickLogout = () => {
    setIsProfileOpen(false)
    dispatch(logoutUserAction(
      () => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_SIGN_OUT_CLICKED
        })
      }
    ))
  }

  const handleToggleProfile = () => {
    if (!isProfileOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_PROFILE_OPENED
      })
    }
    setIsProfileOpen((v) => !v)
  }

  const { accounts, currentAccountId, name } = data

  return (
    <div className={styles.wrapper} data-testid="user-profile-badge">
      <EuiPopover
        ownFocus
        initialFocus={false}
        anchorPosition="upRight"
        isOpen={isProfileOpen}
        closePopover={() => setIsProfileOpen(false)}
        panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
        button={(
          <div
            role="presentation"
            onClick={handleToggleProfile}
            className={styles.profileBtn}
            data-testid="user-profile-btn"
          >
            {getTruncatedName(name) || 'R'}
          </div>
        )}
      >
        <div className={styles.popoverOptions} data-testid="user-profile-popover-content">
          <div className={styles.option}>
            <FeatureFlagComponent
              name={FeatureFlags.envDependent}
              otherwise={<EuiText className={styles.optionTitle}>Account</EuiText>}
            >
              <EuiText className={styles.optionTitle}>Redis Cloud account</EuiText>
            </FeatureFlagComponent>
            <div className={styles.accounts}>
              {accounts?.map(({ name, id }) => (
                <div
                  role="presentation"
                  key={id}
                  className={cx(
                    styles.account,
                    {
                      [styles.isCurrent]: id === currentAccountId,
                      [styles.isSelected]: id === currentAccountId && accounts?.length > 1,
                      [styles.isDisabled]: selectingAccountId,
                    }
                  )}
                  onClick={() => handleClickSelectAccount?.(id)}
                  data-testid={`profile-account-${id}${id === currentAccountId ? '-selected' : ''}`}
                >
                  <EuiText className={styles.accountNameId}>
                    <span className={styles.accountName}>{name}</span> #{id}
                  </EuiText>
                  {id === currentAccountId && (<EuiIcon type="check" />)}
                  {id === selectingAccountId && (<EuiLoadingSpinner className={styles.loadingSpinner} size="m" />)}
                </div>
              ))}
            </div>
          </div>
          <FeatureFlagComponent
            name={FeatureFlags.envDependent}
            otherwise={(
              <EuiLink
                external={false}
                target="_blank"
                className={cx(styles.option, styles.clickableOption)}
                href={riConfig.app.smConsoleRedirect}
                data-testid="cloud-admin-console-link"
              >
                <EuiText>Back to Redis Cloud Admin console</EuiText>
                <EuiIcon type={CloudIcon} style={{ fill: 'none' }} viewBox="-1 0 30 20" strokeWidth={1.8} />
              </EuiLink>
            )}
          >
            <div
              role="presentation"
              className={cx(styles.option, styles.clickableOption, { [styles.isDisabled]: isImportLoading })}
              onClick={handleClickImport}
              data-testid="profile-import-cloud-databases"
            >
              <EuiText className={styles.optionTitle}>Import Cloud databases</EuiText>
              {isImportLoading ? (
                <EuiLoadingSpinner className={styles.loadingSpinner} size="m" />
              ) : (
                <EuiIcon type="importAction" />
              )}
            </div>
            <EuiLink
              external={false}
              target="_blank"
              className={cx(styles.option, styles.clickableOption)}
              href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, { campaign: 'cloud_account' })}
              onClick={handleClickCloudAccount}
              data-testid="cloud-console-link"
            >
              <div className={styles.optionTitleWrapper}>
                <EuiText className={styles.optionTitle}>Cloud Console</EuiText>
                <EuiText
                  className={cx('truncateText', styles.accountFullName)}
                  data-testid="account-full-name"
                >
                  {name}
                </EuiText>
              </div>
              <EuiIcon type={CloudIcon} style={{ fill: 'none' }} viewBox="-1 0 30 20" strokeWidth={1.8} />
            </EuiLink>
            <div
              role="presentation"
              className={cx(styles.option, styles.clickableOption)}
              onClick={handleClickLogout}
              data-testid="profile-logout"
            >
              <EuiText className={styles.optionTitle}>Logout</EuiText>
              <EuiIcon type="exit" />
            </div>
          </FeatureFlagComponent>
        </div>
      </EuiPopover>
    </div>
  )
}

export default UserProfile
