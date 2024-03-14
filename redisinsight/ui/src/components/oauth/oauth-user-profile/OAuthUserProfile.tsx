import React, { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { EuiIcon, EuiLink, EuiLoadingSpinner, EuiPopover, EuiText } from '@elastic/eui'
import cx from 'classnames'
import OAuthSignInButton from 'uiSrc/components/oauth/oauth-sign-in-button'
import { activateAccount, logoutUserAction, oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { ReactComponent as CloudIcon } from 'uiSrc/assets/img/oauth/cloud.svg'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { getTruncatedName } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  source: OAuthSocialSource
}

const OAuthUserProfile = (props: Props) => {
  const { source } = props
  const [selectingAccountId, setSelectingAccountId] = useState<number>()
  const { data } = useSelector(oauthCloudUserSelector)

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const dispatch = useDispatch()

  if (!data) {
    return (
      <div className={styles.wrapper}>
        <OAuthSignInButton source={source} />
      </div>
    )
  }

  const handleClickSelectAccount = (id: number) => {
    if (selectingAccountId) return

    setSelectingAccountId(id)
    dispatch(activateAccount(
      `${id}`,
      () => {
        setSelectingAccountId(undefined)
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_PROFILE_OPENED
        })
      },
      () => {
        setSelectingAccountId(undefined)
      }
    ))
  }

  const handleClickCloudAccount = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CONSOLE_CLICKED
    })
  }

  const handleClickLogout = () => {
    setIsProfileOpen(false)
    dispatch(logoutUserAction(
      () => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_ACCOUNT_LOGOUT
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
    <div className={styles.wrapper}>
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
        <div className={styles.popoverOptions}>
          <div className={styles.option}>
            <EuiText className={styles.optionTitle}>Redis Cloud account</EuiText>
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
                  onClick={() => handleClickSelectAccount(id)}
                  data-testid={`profile-account-${id}${id === currentAccountId ? '-selected' : ''}`}
                >
                  <EuiText className={styles.accountName}>{name}</EuiText>
                  {id === currentAccountId && (<EuiIcon type="check" />)}
                  {id === selectingAccountId && (<EuiLoadingSpinner className={styles.loadingSpinner} size="m" />)}
                </div>
              ))}
            </div>
          </div>
          <div
            role="presentation"
            className={cx(styles.option, styles.clickableOption)}
            data-testi="import-cloud-databases"
          >
            <EuiText className={styles.optionTitle}>Import Cloud databases</EuiText>
            <EuiIcon type="importAction" />
          </div>
          <EuiLink
            external={false}
            target="_blank"
            className={cx(styles.option, styles.clickableOption)}
            href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, { campaign: 'cloud_account' })}
            onClick={handleClickCloudAccount}
            data-testid="cloud-console-link"
          >
            <EuiText className={styles.optionTitle}>Cloud Console</EuiText>
            <EuiIcon type={CloudIcon} style={{ fill: 'none' }} />
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
        </div>
      </EuiPopover>
    </div>
  )
}

export default OAuthUserProfile
