import React, { ChangeEvent, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiSuperSelect,
  EuiText,
  EuiToolTip
} from '@elastic/eui'
import { checkDateTimeFormat, formatTimestamp } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT, DatetimeRadioOption, TimezoneOption, dateTimeOptions } from 'uiSrc/constants'
import { updateUserConfigSettingsAction, userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import icheck from 'uiSrc/assets/img/icons/check.svg'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

interface InitialValuesType {
  format: string
  customFormat: string
  commonFormat: string
  selectedRadioOption: DatetimeRadioOption
}

export interface Props {
  onFormatChange: (newPreview: string) => void
}

const DatetimeForm = ({ onFormatChange }: Props) => {
  const [error, setError] = useState('')
  const [saveFormatSucceed, setSaveFormatSucceed] = useState(false)
  const config = useSelector(userSettingsConfigSelector)
  const dispatch = useDispatch()

  const getInitialDateTime = (): InitialValuesType => {
    const format = config?.dateFormat || DATETIME_FORMATTER_DEFAULT
    const selectedRadioOption = dateTimeOptions.some((opt) => opt.value === format)
      ? DatetimeRadioOption.Common
      : DatetimeRadioOption.Custom

    return {
      selectedRadioOption,
      format,
      customFormat: selectedRadioOption === DatetimeRadioOption.Custom ? format : '',
      commonFormat: selectedRadioOption === DatetimeRadioOption.Common ? format : dateTimeOptions[0].value,
    }
  }

  const getInitialValues = useMemo(() => getInitialDateTime(), [config])

  const formik = useFormik({
    initialValues: getInitialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    }
  })

  const submitForm = async (values: InitialValuesType) => {
    if (checkDateTimeFormat(values.format).valid) {
      dispatch(
        updateUserConfigSettingsAction(
          { dateFormat: values.format.trim() },
          () => {
            formik.setSubmitting(false)
            setTimeout(() => setSaveFormatSucceed(false), 5000)
          },
          () => {
            formik.setSubmitting(false)
          }
        )
      )
    } else {
      setError('This format is not supported.')
      formik.setSubmitting(false)
    }
  }

  const showError = !!error || !formik.values.customFormat
  const getBtnIconType = () => (showError ? 'iInCircle' : ((!formik.isSubmitting && saveFormatSucceed) ? icheck : undefined))

  const handleFormatCheck = (format = formik.values.format) => {
    const { valid, error: errorMsg } = checkDateTimeFormat(format)
    if (format.length > 50) {
      setError('Format should not exceed 50 characters')
    } else if (!valid) {
      setError(errorMsg || 'This format is not supported')
      onFormatChange?.('Invalid Format')
    } else {
      setError('')
      const newPreview = formatTimestamp(new Date(), format, config?.timezone || TimezoneOption.Local)
      onFormatChange?.(newPreview)
    }
    return valid
  }

  const onRadioOptionChange = (id: string) => {
    formik.setFieldValue('selectedRadioOption', id)
    if (id === DatetimeRadioOption.Custom) {
      formik.setFieldValue('customFormat', formik.values.format)
    } else {
      formik.setFieldValue('format', formik.values.commonFormat)
      sendEventTelemetry({
        event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
        eventData: {
          currentFormat: formik.values.commonFormat,
        }
      })
      formik.handleSubmit()
    }
  }

  const onCustomFormatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    formik.setFieldValue('customFormat', value)
    formik.setFieldValue('format', value)
    handleFormatCheck(value)
  }

  const onCommonFormatChange = (value: string) => {
    formik.setFieldValue('commonFormat', value)
    formik.setFieldValue('format', value)

    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: value,
      }
    })
    formik.handleSubmit()
  }

  const onCustomFormatSubmit = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: formik.values.customFormat,
      }
    })
    setSaveFormatSucceed(true)
    formik.handleSubmit()
  }

  const dateTimeFormatOptions: EuiRadioGroupOption[] = [
    {
      id: DatetimeRadioOption.Common,
      label: (
        <div className={styles.radioLabelWrapper}>
          <div className={styles.radioLabelTextContainer}>
            <EuiText color="subdued" className={styles.radioLabelText}>Pre-selected formats</EuiText>
          </div>
          <EuiSuperSelect
            className={styles.datetimeInput}
            options={dateTimeOptions
              .map((option) => ({ ...option, 'data-test-subj': `date-option-${option.value}` }))}
            valueOfSelected={formik.values.commonFormat}
            onChange={(option) => onCommonFormatChange(option)}
            disabled={formik.values.selectedRadioOption !== DatetimeRadioOption.Common}
            data-test-subj="select-datetime"
            data-testid="select-datetime-testid"
          />
        </div>
      ),
    },
    {
      id: DatetimeRadioOption.Custom,
      label: (
        <div className={styles.radioLabelWrapper}>
          <div className={styles.radioLabelTextContainer}>
            <EuiText color="subdued" className={styles.radioLabelText}>Custom</EuiText>
          </div>
          {formik.values.selectedRadioOption === DatetimeRadioOption.Custom && (
            <>
              <EuiFieldText
                className={styles.datetimeInput}
                id="customFormat"
                name="customFormat"
                value={formik.values.customFormat}
                onChange={(e) => onCustomFormatChange(e)}
                data-testid="custom-datetime-input"
              />
              <EuiToolTip
                position="top"
                anchorClassName="euiToolTip__btn-disabled"
                content={showError ? (error || 'This format is not supported') : null}
              >
                <EuiButton
                  aria-label="Save"
                  isLoading={formik.isSubmitting}
                  color="secondary"
                  fill
                  size="m"
                  className={styles.customBtn}
                  onClick={onCustomFormatSubmit}
                  data-testid="datetime-custom-btn"
                  iconType={getBtnIconType()}
                  disabled={showError}
                >Save
                </EuiButton>
              </EuiToolTip>
            </>
          )}
        </div>)
    }
  ]

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="format-timestamp-form">
      <EuiRadioGroup
        options={dateTimeFormatOptions}
        className={styles.radios}
        name="radioDateTime"
        idSelected={formik.values.selectedRadioOption}
        onChange={(id) => onRadioOptionChange(id)}
      />
    </EuiForm>
  )
}

export default DatetimeForm
