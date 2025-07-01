import { EuiIcon, EuiPopover } from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ReleaseNotesSource } from 'uiSrc/constants/telemetry'
import {
  appElectronInfoSelector,
  setReleaseNotesViewed,
  setShortcutsFlyoutState,
} from 'uiSrc/slices/app/info'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { setOnboarding } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import GithubHelpCenterSVG from 'uiSrc/assets/img/github.svg?react'
import BulbSVG from 'uiSrc/assets/img/bulb.svg?react'

import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { SupportIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { NavigationItemWrapper } from 'uiSrc/components/navigation-menu/NavigationItemWrapper'
import { Link } from 'uiSrc/components/base/link/Link'
import navStyles from '../../styles.module.scss'
import styles from './styles.module.scss'

const HelpMenu = () => {
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )
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
        source: ReleaseNotesSource.helpCenter,
      },
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
      },
    })
  }

  const HelpMenuButton = () => (
    <NavigationItemWrapper
      className={cx(navStyles.navigationButton, {
        [navStyles.navigationButtonNotified]: isReleaseNotesViewed === false,
      })}
    >
      <IconButton
        size="L"
        icon={SupportIcon}
        aria-label="Help Menu"
        onClick={() => setIsHelpMenuActive((value) => !value)}
        data-testid="help-menu-button"
      />
    </NavigationItemWrapper>
  )

  return (
    <EuiPopover
      anchorPosition="rightUp"
      isOpen={isHelpMenuActive}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx(
        'euiToolTip',
        'popoverLikeTooltip',
        styles.popoverWrapper,
      )}
      closePopover={() => setIsHelpMenuActive(false)}
      button={
        <>
          {!isHelpMenuActive && (
            <RiTooltip content="Help" position="right" key="help-menu">
              {HelpMenuButton()}
            </RiTooltip>
          )}

          {isHelpMenuActive && HelpMenuButton()}
        </>
      }
    >
      <div className={styles.popover} data-testid="help-center">
        <Title size="XS" className={styles.helpMenuTitle}>
          Help Center
        </Title>
        <Spacer size="l" />
        <Row
          className={styles.helpMenuItems}
          align="center"
          justify="between"
          gap="l"
        >
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <FlexItem grow={2} className={styles.helpMenuItem}>
              <Link
                className={styles.helpMenuItemLink}
                href={EXTERNAL_LINKS.githubIssues}
                target="_blank"
                data-testid="submit-bug-btn"
              >
                <EuiIcon type={GithubHelpCenterSVG} size="xxl" />
                <Spacer size="m" />
                <Text
                  size="xs"
                  textAlign="center"
                  className={styles.helpMenuText}
                >
                  Provide <br /> Feedback
                </Text>
              </Link>
            </FlexItem>
          </FeatureFlagComponent>
          <FlexItem className={styles.helpMenuItemRow} grow={4}>
            <div className={styles.helpMenuItemLink}>
              <EuiIcon type="keyboardShortcut" size="l" />
              <Text
                size="xs"
                className={styles.helpMenuTextLink}
                onClick={() => onKeyboardShortcutClick()}
                data-testid="shortcuts-btn"
              >
                Keyboard Shortcuts
              </Text>
            </div>

            <div className={styles.helpMenuItemLink}>
              <div
                className={cx({
                  [styles.helpMenuItemNotified]: isReleaseNotesViewed === false,
                })}
                style={{ display: 'flex' }}
              >
                <EuiIcon type="package" size="l" />
              </div>
              <Link
                onClick={onClickReleaseNotes}
                className={styles.helpMenuTextLink}
                href={EXTERNAL_LINKS.releaseNotes}
                target="_blank"
                data-testid="release-notes-btn"
              >
                <Text size="xs" className={styles.helpMenuTextLink}>
                  Release Notes
                </Text>
              </Link>
            </div>
            <FeatureFlagComponent name={FeatureFlags.envDependent}>
              <div className={styles.helpMenuItemLink}>
                <EuiIcon type={BulbSVG} size="l" />
                <Text
                  size="xs"
                  className={styles.helpMenuTextLink}
                  onClick={() => onResetOnboardingClick()}
                  data-testid="reset-onboarding-btn"
                >
                  Reset Onboarding
                </Text>
              </div>
            </FeatureFlagComponent>
          </FlexItem>
        </Row>
      </div>
    </EuiPopover>
  )
}

export default HelpMenu
