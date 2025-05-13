import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiForm, EuiFormRow, EuiSuperSelect, EuiTitle } from '@elastic/eui'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { THEMES } from 'uiSrc/constants'

const ThemeSettings = () => {
  const dispatch = useDispatch()
  const [selectedTheme, setSelectedTheme] = useState('')
  const options = THEMES
  const themeContext = useContext(ThemeContext)
  const { theme, changeTheme } = themeContext
  const { config } = useSelector(userSettingsSelector)
  const previousThemeRef = useRef<string>(theme)

  useEffect(() => {
    if (config) {
      setSelectedTheme(config.theme)
      previousThemeRef.current = config.theme
    }
  }, [config])

  const onChange = (value: string) => {
    const previousValue = previousThemeRef.current
    if (previousValue === value) {
      return
    }
    changeTheme(value)
    dispatch(updateUserConfigSettingsAction({ theme: value }))
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_COLOR_THEME_CHANGED,
      eventData: {
        previousColorTheme: previousValue,
        currentColorTheme: value,
      },
    })
  }

  return (
    <EuiForm component="form">
      <EuiTitle size="xs">
        <h4>Color Theme</h4>
      </EuiTitle>
      <Spacer size="m" />
      <EuiFormRow label="Specifies the color theme to be used in Redis Insight:">
        <EuiSuperSelect
          options={options}
          valueOfSelected={selectedTheme}
          onChange={onChange}
          style={{ marginTop: '12px' }}
          data-test-subj="select-theme"
          data-testid="select-theme"
        />
      </EuiFormRow>
      <Spacer size="xl" />
    </EuiForm>
  )
}

export default ThemeSettings
