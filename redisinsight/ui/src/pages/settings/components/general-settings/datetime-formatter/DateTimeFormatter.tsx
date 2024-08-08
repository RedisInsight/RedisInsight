import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { EuiButton, EuiFieldText, EuiForm, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { checkDateTimeFormat } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT } from 'uiSrc/constants'
import { updateUserConfigSettingsAction, userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'

const DateTimeFormatter = () => {
  const [error, setError] = useState('')
  const config = useSelector(userSettingsConfigSelector)

  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      format: config?.dateFormat || DATETIME_FORMATTER_DEFAULT,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    }
  })

  const submitForm = async (values: any) => {
    setError('')
    if (checkDateTimeFormat(values.format.trim())) {
      dispatch(
        updateUserConfigSettingsAction(
          { dateFormat: values.format.trim() },
        )
      )
    } else {
      setError('This format is not supported.')
    }
    formik.setSubmitting(false)
  }

  const onChangeFormat = (event: ChangeEvent<HTMLInputElement>) => {
    setError('')
    formik.setFieldValue('format', event.target.value)
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="format-timestamp-form">
      <EuiTitle size="xs">
        <h4>DateTime Format</h4>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFieldText
        id="format"
        name="format"
        value={formik.values.format}
        onChange={onChangeFormat}
      />
      <EuiSpacer size="m" />
      <EuiButton type="submit" onClick={formik.submitForm} disabled={formik.isSubmitting}>Apply Format</EuiButton>
      {error && (
        <EuiText>{error}</EuiText>
      )}
    </EuiForm>
  )
}

export default DateTimeFormatter
