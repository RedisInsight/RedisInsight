import { Spacer } from "uiSrc/components/base/layout/spacer";
import React, { useContext, useEffect, useState } from "react";
import {
  updateUserConfigSettingsAction,
  userSettingsSelector
} from "uiSrc/slices/user/user-settings";
import { sendEventTelemetry, TelemetryEvent } from "uiSrc/telemetry";
import { THEMES } from "../../../../constants/themes";
import { ThemeContext } from "uiSrc/contexts/themeContext";
import {
  EuiForm,
  EuiFormRow,
  EuiSuperSelect,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from "react-redux";

const ThemeSettings = () => {

  const dispatch = useDispatch()
  const [selectedTheme, setSelectedTheme] = useState('')
  const options = THEMES
  const themeContext = useContext(ThemeContext)
  let { theme, changeTheme } = themeContext
  const { config } = useSelector(userSettingsSelector)

  useEffect(() => {
    if (config) {
      setSelectedTheme(config.theme);
      theme = config.theme;
    }
  }, [config])

  const onChange = (value: string) => {
    const previousValue = theme
    changeTheme(value)
    dispatch(updateUserConfigSettingsAction({theme: value}));
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
          />
        </EuiFormRow>
        <Spacer size="xl" />
      </EuiForm>
  );
}

export default ThemeSettings
