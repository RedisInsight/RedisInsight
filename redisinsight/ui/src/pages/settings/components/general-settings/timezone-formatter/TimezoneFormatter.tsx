import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { has, update } from 'lodash'
import { EuiButton, EuiFieldText, EuiForm, EuiSpacer, EuiTitle } from '@elastic/eui'
import { dateFormat } from '@elastic/eui/src/components/search_bar/query/date_format'
import { updateUserConfigSettingsAction, userSettingsConfigSelector, userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { checkDateTimeFormat } from 'uiSrc/utils'

const TimezoneFormatter = () => {
  const [error, setError] = useState('')
  const config = useSelector(userSettingsConfigSelector)
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      timezone: config?.timezone || 'local'
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    }
  })

  const checkTimezone = (timezone: string) => true

  const submitForm = (values: any) => {
    setError('')
    if (checkTimezone(values.timezone.trim())) {
      dispatch(updateUserConfigSettingsAction(
        { timezone: values.timezone.trim() }
      ))
    } else {
      setError('This format is not supported')
    }
    formik.setSubmitting(false)
  }

  const onChangeField = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('timezone', event.target.value)
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="timezone-form">
      <EuiTitle size="xs">
        <h4>Timezone Format</h4>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFieldText
        id="timezone"
        name="timezone"
        value={formik.values.timezone}
        onChange={onChangeField}
      />
      <EuiSpacer size="m" />
      <EuiButton type="submit" onClick={formik.submitForm}>Apply Timezone</EuiButton>
    </EuiForm>
  )
}

export default TimezoneFormatter
