import React, { useState } from 'react'
import { EuiIcon, EuiLink, EuiPopover, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { getConfig } from 'uiSrc/config'
import { getTruncatedName } from 'uiSrc/utils'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud.svg?react'
import { cloudUserProfileSelector } from 'uiSrc/slices/user/cloud-user-profile'
import styles from './cloud-user-profile.module.scss'

const riConfig = getConfig()

export const CloudUserProfile = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { data } = useSelector(cloudUserProfileSelector)
  if (!data?.name) {
    return null
  }

  const handleToggleProfile = () => {
    setIsProfileOpen((v) => !v)
  }

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
            {getTruncatedName(data?.name)}
          </div>
        )}
      >
        <div className={styles.popoverOptions}>
          <div className={styles.option}>
            <EuiText className={styles.optionTitle}>Account</EuiText>
            <div className={styles.accounts}>
              <div
                role="presentation"
                className={cx(
                  styles.account,
                  styles.isCurrent,
                  styles.isSelected
                )}
              >
                <EuiText className={styles.accountNameId}>
                  <span className={styles.accountName}>{data?.currentAccountName}</span> #{data?.currentAccountId}
                </EuiText>
                <EuiIcon type="check" />
              </div>
            </div>
          </div>
          <EuiLink
            external={false}
            target="_blank"
            className={cx(styles.option, styles.clickableOption)}
            href={riConfig.app.smConsoleRedirect}
            data-testid="cloud-console-link"
          >
            <EuiText>Back to admin console</EuiText>
            <EuiIcon type={CloudIcon} style={{ fill: 'none' }} viewBox="-1 0 30 20" strokeWidth={1.8} />
          </EuiLink>
        </div>
      </EuiPopover>
    </div>
  )
}
