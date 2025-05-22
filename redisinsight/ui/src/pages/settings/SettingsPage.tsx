import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiCallOut,
  EuiCollapsibleNavGroup,
  EuiLoadingSpinner,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { setTitle } from 'uiSrc/utils'
import { FeatureFlags } from 'uiSrc/constants'
import { useDebouncedEffect } from 'uiSrc/services'
import {
  ConsentsNotifications,
  ConsentsPrivacy,
  FeatureFlagComponent,
} from 'uiSrc/components'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'

import Divider from 'uiSrc/components/divider/Divider'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  Page,
  PageBody,
  PageHeader,
  PageContentBody,
} from 'uiSrc/components/base/layout/page'
import {
  AdvancedSettings,
  CloudSettings,
  WorkbenchSettings,
  ThemeSettings,
} from './components'
import { DateTimeFormatter } from './components/general-settings'
import styles from './styles.module.scss'

const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const { loading: settingsLoading } = useSelector(userSettingsSelector)

  const initialOpenSection = globalThis.location.hash || ''

  const dispatch = useDispatch()

  useEffect(() => {
    // componentDidMount
    // fetch config settings, after that take spec
    dispatch(fetchUserConfigSettings(() => dispatch(fetchUserSettingsSpec())))
  }, [])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.SETTINGS_PAGE,
    })
  }, [])

  useDebouncedEffect(() => setLoading(settingsLoading), 100, [settingsLoading])
  setTitle('Settings')

  const Appearance = () => (
    <>
      <ThemeSettings />
      <ConsentsNotifications />
      <Divider colorVariable="separatorColor" />
      <Spacer />
      <DateTimeFormatter />
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

  const CloudSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      <CloudSettings />
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
          Advanced settings should only be changed if you understand their
          impact.
        </EuiText>
      </EuiCallOut>
      <AdvancedSettings />
    </div>
  )

  return (
    <Page className={styles.container}>
      <PageBody component="div">
        <PageHeader>
          <EuiTitle size="l">
            <h1 className={styles.title}>Settings</h1>
          </EuiTitle>
        </PageHeader>

        <PageContentBody style={{ maxWidth: 792 }}>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="General"
            initialIsOpen={initialOpenSection === '#general'}
            data-test-subj="accordion-appearance"
          >
            {Appearance()}
          </EuiCollapsibleNavGroup>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="Privacy"
            initialIsOpen={initialOpenSection === '#privacy'}
            data-test-subj="accordion-privacy-settings"
          >
            {PrivacySettings()}
          </EuiCollapsibleNavGroup>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={styles.accordion}
            title="Workbench"
            initialIsOpen={initialOpenSection === '#workbench'}
            data-test-subj="accordion-workbench-settings"
          >
            {WorkbenchSettingsGroup()}
          </EuiCollapsibleNavGroup>
          <FeatureFlagComponent name={FeatureFlags.cloudSso}>
            <EuiCollapsibleNavGroup
              isCollapsible
              className={cx(styles.accordion, styles.accordionWithSubTitle)}
              title="Redis Cloud"
              initialIsOpen={initialOpenSection === '#cloud'}
              data-test-subj="accordion-cloud-settings"
            >
              {CloudSettingsGroup()}
            </EuiCollapsibleNavGroup>
          </FeatureFlagComponent>
          <EuiCollapsibleNavGroup
            isCollapsible
            className={cx(styles.accordion, styles.accordionWithSubTitle)}
            title="Advanced"
            initialIsOpen={initialOpenSection === '#advanced'}
            data-test-subj="accordion-advanced-settings"
          >
            {AdvancedSettingsGroup()}
          </EuiCollapsibleNavGroup>
        </PageContentBody>
      </PageBody>
    </Page>
  )
}

export default SettingsPage
