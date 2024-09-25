import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { EuiForm, EuiSuperSelect } from '@elastic/eui'
import { TimezoneOption, timezoneOptions } from 'uiSrc/constants'
import { updateUserConfigSettingsAction, userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

interface InitialValuesType {
  timezone: TimezoneOption
}

const TimezoneForm = () => {
  const config = useSelector(userSettingsConfigSelector)
  const dispatch = useDispatch()

  const getInitialValues: InitialValuesType = useMemo(
    () => ({ timezone: config?.timezone || TimezoneOption.Local }),
    [config?.timezone]
  )

  const formik = useFormik({
    initialValues: getInitialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    }
  })

  const submitForm = async (values: InitialValuesType) => {
    dispatch(
      updateUserConfigSettingsAction(
        { timezone: values.timezone.trim() },
        () => {
          formik.setSubmitting(false)
        },
        () => {
          formik.setSubmitting(false)
        }
      )
    )
  }

  const onTimezoneChange = (value: string) => {
    formik.setFieldValue('timezone', value)

    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_TIME_ZONE_CHANGED,
      eventData: {
        currentTimezone: value,
      }
    })
    formik.handleSubmit()
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="format-timezone-form">
      <div>
        <EuiSuperSelect
          className={styles.datetimeInput}
          options={timezoneOptions
            .map((option) => ({ ...option, 'data-test-subj': `zone-option-${option.value}` }))}
          valueOfSelected={formik.values.timezone}
          onChange={(option) => onTimezoneChange(option)}
          data-test-subj="select-timezone"
        />
      </div>
    </EuiForm>
  )
}

export default TimezoneForm
