import React, { useContext, useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiForm,
  EuiFormRow,
  EuiSuperSelect,
  EuiPage,
  EuiPageBody,
  EuiPageContentBody,
  EuiTitle,
  EuiPageHeader,
  EuiCollapsibleNavGroup,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiCallOut,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { setTitle } from 'uiSrc/utils'
import { THEMES } from 'uiSrc/constants'
import { useDebouncedEffect } from 'uiSrc/services'
import { ConsentsNotifications, ConsentsPrivacy } from 'uiSrc/components'
import { sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'

import { AdvancedSettings, WorkbenchSettings } from './components'

import styles from './styles.module.scss'

const SettingsPage = () => {
  const options = THEMES
  const themeContext = useContext(ThemeContext)

  const [loading, setLoading] = useState(false)
  const { loading: settingsLoading } = useSelector(userSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)

  const dispatch = useDispatch()
  useEffect(() => {
    // componentDidMount
    // fetch config settings, after that take spec
    dispatch(fetchUserConfigSettings(() => dispatch(fetchUserSettingsSpec())))
  }, [])

  useEffect(() => {
    if (analyticsIdentified) {
      sendPageViewTelemetry({
        name: TelemetryPageView.SETTINGS_PAGE
      })
    }
  }, [analyticsIdentified])

  useDebouncedEffect(() => setLoading(settingsLoading), 100, [settingsLoading])
  setTitle('Settings')

  const onChange = (value: string) => {
    const previousValue = themeContext.theme
    themeContext.changeTheme(value)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_COLOR_THEME_CHANGED,
      eventData: {
        previousColorTheme: previousValue,
        currentColorTheme: value,
      }
    })
  }

  const Appearance = () => (
    <>
      <EuiForm component="form">
        <EuiTitle size="xs">
          <h4>Color Theme</h4>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiFormRow label="Specifies the color theme to be used in RedisInsight:">
          <EuiSuperSelect
            options={options}
            valueOfSelected={themeContext.theme}
            onChange={onChange}
            style={{ marginTop: '12px' }}
            data-test-subj="select-theme"
          />
        </EuiFormRow>
        <EuiSpacer size="xl" />
      </EuiForm>
      <ConsentsNotifications />
    </>
  )

  const PrivacySettings = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      <ConsentsPrivacy />
    </div>
  )

  const WorkbenchSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      <WorkbenchSettings />
    </div>
  )

  const AdvancedSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      <EuiCallOut className={styles.warning}>
        <EuiText size="s" className={styles.smallText}>
          Advanced settings should only be changed if you understand their impact.
        </EuiText>
      </EuiCallOut>
      <AdvancedSettings />
    </div>
  )

  return (
    <EuiPage className={styles.container}>
      <EuiPageBody component="div">
        <EuiPageHeader>
          <EuiTitle size="l">
            <h1 className={styles.title}>Settings</h1>
          </EuiTitle>
        </EuiPageHeader>
        <EuiPageContentBody style={{ maxWidth: 792 }}>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="General"
            initialIsOpen={false}
            data-test-subj="accordion-appearance"
          >
            {Appearance()}
          </EuiCollapsibleNavGroup>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="Privacy"
            initialIsOpen={false}
            data-test-subj="accordion-privacy-settings"
          >
            {PrivacySettings()}
          </EuiCollapsibleNavGroup>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="Workbench"
            initialIsOpen={false}
            data-test-subj="accordion-workbench-settings"
          >
            {WorkbenchSettingsGroup()}
          </EuiCollapsibleNavGroup>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={cx(styles.accordion, styles.accordionWithSubTitle)}
            title="Advanced"
            initialIsOpen={false}
            data-test-subj="accordion-advanced-settings"
          >
            {AdvancedSettingsGroup()}
          </EuiCollapsibleNavGroup>
        </EuiPageContentBody>
      </EuiPageBody>
    </EuiPage>
  )
}

export default SettingsPage
