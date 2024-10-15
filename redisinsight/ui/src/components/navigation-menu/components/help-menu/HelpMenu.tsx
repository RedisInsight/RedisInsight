import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ReleaseNotesSource } from 'uiSrc/constants/telemetry'
import { appElectronInfoSelector, setReleaseNotesViewed, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { setOnboarding } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import GithubHelpCenterSVG from 'uiSrc/assets/img/github.svg?react'
import BulbSVG from 'uiSrc/assets/img/bulb.svg?react'

import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import navStyles from '../../styles.module.scss'
import styles from './styles.module.scss'

const HelpMenu = () => {
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const [isHelpMenuActive, setIsHelpMenuActive] = useState(false)

  const dispatch = useDispatch()

  const onKeyboardShortcutClick = () => {
    setIsHelpMenuActive(false)
    dispatch(setShortcutsFlyoutState(true))
  }

  const onClickReleaseNotes = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RELEASE_NOTES_LINK_CLICKED,
      eventData: {
        source: ReleaseNotesSource.helpCenter
      }
    })
    if (isReleaseNotesViewed === false) {
      dispatch(setReleaseNotesViewed(true))
    }
  }

  const onResetOnboardingClick = () => {
    const totalSteps = Object.keys(ONBOARDING_FEATURES || {}).length

    dispatch(setOnboarding({ currentStep: 0, totalSteps }))
    sendEventTelemetry({
      event: TelemetryEvent.ONBOARDING_TOUR_TRIGGERED,
      eventData: {
        databaseId: connectedInstanceId || '-',
      }
    })
  }

  const HelpMenuButton = () => (
    <EuiButtonIcon
      className={
        cx(navStyles.navigationButton, { [navStyles.navigationButtonNotified]: isReleaseNotesViewed === false })
      }
      iconType="questionInCircle"
      iconSize="l"
      aria-label="Help Menu"
      onClick={() => setIsHelpMenuActive((value) => !value)}
      data-testid="help-menu-button"
    />
  )

  return (
    <EuiPopover
      anchorPosition="rightUp"
      isOpen={isHelpMenuActive}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverWrapper)}
      closePopover={() => setIsHelpMenuActive(false)}
      button={(
        <>
          {!isHelpMenuActive && (
            <EuiToolTip content="Help" position="right" key="help-menu">
              {HelpMenuButton()}
            </EuiToolTip>
          )}

          {isHelpMenuActive && HelpMenuButton()}
        </>
      )}
    >
      <div className={styles.popover} data-testid="help-center">
        <EuiTitle size="xs" className={styles.helpMenuTitle}>
          <span>Help Center</span>
        </EuiTitle>
        <EuiSpacer size="l" />
        <EuiFlexGroup
          className={styles.helpMenuItems}
          alignItems="center"
          justifyContent="spaceBetween"
          gutterSize="m"
          responsive={false}
        >
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <EuiFlexItem grow={2} className={styles.helpMenuItem}>
              <EuiLink
                external={false}
                className={styles.helpMenuItemLink}
                href={EXTERNAL_LINKS.githubIssues}
                target="_blank"
                data-testid="submit-bug-btn"
              >
                <EuiIcon type={GithubHelpCenterSVG} size="xxl" />
                <EuiSpacer size="m" />
                <EuiText size="xs" textAlign="center" className={styles.helpMenuText}>
                  Provide <br /> Feedback
                </EuiText>
              </EuiLink>
            </EuiFlexItem>
          </FeatureFlagComponent>
          <EuiFlexItem
            className={styles.helpMenuItemRow}
            grow={4}
          >
            <div className={styles.helpMenuItemLink}>
              <EuiIcon type="keyboardShortcut" size="l" />
              <EuiText
                size="xs"
                className={styles.helpMenuTextLink}
                onClick={() => onKeyboardShortcutClick()}
                data-testid="shortcuts-btn"
              >
                Keyboard Shortcuts
              </EuiText>
            </div>

            <div className={styles.helpMenuItemLink}>
              <div
                className={cx({ [styles.helpMenuItemNotified]: isReleaseNotesViewed === false })}
                style={{ display: 'flex' }}
              >
                <EuiIcon type="package" size="l" />
              </div>
              <EuiLink
                external={false}
                onClick={onClickReleaseNotes}
                className={styles.helpMenuTextLink}
                href={EXTERNAL_LINKS.releaseNotes}
                target="_blank"
                data-testid="release-notes-btn"
              >
                <EuiText size="xs" className={styles.helpMenuTextLink}>Release Notes</EuiText>
              </EuiLink>
            </div>
            <FeatureFlagComponent name={FeatureFlags.envDependent}>
              <div className={styles.helpMenuItemLink}>
                <EuiIcon type={BulbSVG} size="l" />
                <EuiText
                  size="xs"
                  className={styles.helpMenuTextLink}
                  onClick={() => onResetOnboardingClick()}
                  data-testid="reset-onboarding-btn"
                >
                  Reset Onboarding
                </EuiText>
              </div>
            </FeatureFlagComponent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPopover>
  )
}

export default HelpMenu
