import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, forEach } from 'lodash'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSwitch,
  EuiSpacer,
  EuiText,
  EuiButton,
  EuiTitle,
  EuiToolTip,
  EuiForm,
  EuiHorizontalRule,
  EuiCallOut,
  EuiLink,
} from '@elastic/eui'
import { EuiSwitchEvent } from '@elastic/eui/src/components/form/switch'
import cx from 'classnames'

import { compareConsents } from 'uiSrc/utils'
import { updateUserConfigSettingsAction, userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ConsentOption from './ConsentOption'

import styles from './styles.module.scss'

interface Values {
  [key: string]: string;
}

export interface IConsent {
  defaultValue: boolean
  displayInSetting: boolean
  required: boolean
  editable: boolean
  disabled: boolean
  category?: string
  since: string
  title: string
  label: string
  agreementName: string
  description?: string
}

export enum ConsentCategories {
  Notifications = 'notifications',
  Privacy = 'privacy'
}

export interface Props {
  onSubmitted?: () => void
}

const ConsentsSettings = ({ onSubmitted }: Props) => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [privacyConsents, setPrivacyConsents] = useState<IConsent[]>([])
  const [notificationConsents, setNotificationConsents] = useState<IConsent[]>([])
  const [requiredConsents, setRequiredConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<any>({})
  const [errors, setErrors] = useState<FormikErrors<Values>>({})
  const [isRecommended, setIsRecommended] = useState<boolean>(false)
  const [valuesBuffer, setValuesBuffer] = useState<Values>({})

  const { config, spec } = useSelector(userSettingsSelector)

  const dispatch = useDispatch()

  const submitIsDisabled = () => !isEmpty(errors)

  const validate = (values: any) => {
    const errs: FormikErrors<any> = {}
    requiredConsents.forEach((consent) => {
      if (!values[consent.agreementName]) {
        errs[consent.agreementName] = consent.agreementName
      }
    })
    setErrors(errs)
    return errs
  }

  const selectAll = (e: EuiSwitchEvent) => {
    setIsRecommended(e.target.checked)

    if (e.target.checked) {
      const newBufferValues:Values = {}
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          newBufferValues[consent.agreementName] = formik.values[consent.agreementName]
          formik.setFieldValue(consent.agreementName, true)
        }
        setValuesBuffer(newBufferValues)
      })
    } else {
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          formik.setFieldValue(consent.agreementName, valuesBuffer[consent.agreementName])
        }
      })
    }
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements))
    }
  }, [spec, config])

  useEffect(() => {
    if (!isRecommended) {
      setValuesBuffer({})
    }
  }, [isRecommended])

  useEffect(() => {
    setRequiredConsents(consents.filter(
      (consent: IConsent) => consent.required
    ))
    setPrivacyConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === ConsentCategories.Privacy
    ))
    setNotificationConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === ConsentCategories.Notifications
    ))
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({ ...acc, [cur.agreementName]: cur.defaultValue }),
        {}
      )

      setInitialValues(values)
    }
  }, [consents])

  useEffect(() => {
    formik.validateForm(initialValues)
  }, [requiredConsents])

  useEffect(() => {
    setIsRecommended(checkIsRecommended())
  }, [formik.values])

  const checkIsRecommended = () => {
    let recommended = true
    forEach(privacyConsents, (consent) => {
      if (!formik.values[consent?.agreementName] && !consent.disabled) {
        recommended = false
        return false
      }
    })

    forEach(notificationConsents, (consent) => {
      if (!formik.values[consent?.agreementName] && !consent.disabled) {
        recommended = false
        return false
      }
    })

    return recommended
  }

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
  }

  const submitForm = (values: any) => {
    if (submitIsDisabled()) {
      return
    }
    // have only one switcher in notificationConsents
    if (notificationConsents.length) {
      sendEventTelemetry({
        event: values[notificationConsents[0]?.agreementName]
          ? TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_ENABLED
          : TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_DISABLED,
      })
    }
    dispatch(updateUserConfigSettingsAction({ agreements: values }, onSubmitted))
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <EuiSpacer size="m" />
        {consents.length > 1 && (
          <>
            <EuiCallOut>
              <EuiText size="s" className={styles.smallText} data-testid="plugin-section">
                To avoid automatic execution of malicious code, when adding new Workbench plugins,
                use files from trusted authors only.
              </EuiText>
            </EuiCallOut>
            <EuiSpacer size="l" />
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiSwitch
                    showLabel={false}
                    label=""
                    checked={isRecommended}
                    onChange={selectAll}
                    className={styles.switchOption}
                    data-testid="switch-option-recommended"
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText className={styles.label}>Use recommended settings</EuiText>
                  <EuiText size="s" className={styles.smallText} color="subdued" style={{ marginTop: '12px' }}>
                    Select to activate all listed options.
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiHorizontalRule margin="l" className={cx({ [styles.pluginWarningHR]: !!requiredConsents.length })} />
          </>
        )}
        {!!privacyConsents.length && (
          <>
            <EuiSpacer size="l" />
            <EuiTitle size="m">
              <h1 className={styles.title}>Privacy Settings</h1>
            </EuiTitle>
            <EuiSpacer size="m" />
            <EuiText className={styles.smallText} size="s" color="subdued">
              To optimize your experience, Redis Insight uses third-party tools.
            </EuiText>
            <EuiSpacer size="l" />
          </>
        )}
        {
          privacyConsents
            .map((consent: IConsent) => (
              <ConsentOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
                key={consent.agreementName}
              />
            ))
        }
        {!!notificationConsents.length && (
          <>
            <EuiSpacer size="m" />
            <EuiTitle size="m">
              <h1 className={styles.title}>Notifications</h1>
            </EuiTitle>
            <EuiSpacer size="m" />
          </>
        )}
        {
          notificationConsents
            .map((consent: IConsent) => (
              <ConsentOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
                key={consent.agreementName}
              />
            ))
        }
      </div>
      {requiredConsents.length ? (
        <>
          <EuiHorizontalRule margin="l" className={styles.requiredHR} />
          <EuiSpacer size="m" />
          <EuiText color="subdued" size="s" className={styles.smallText}>
            To use Redis Insight, please accept the terms and conditions:{' '}
            <EuiLink
              external={false}
              target="_blank"
              href="https://github.com/RedisInsight/RedisInsight/blob/main/LICENSE"
            >
              Server Side Public License
            </EuiLink>
          </EuiText>
          <EuiSpacer size="m" />
        </>
      ) : (
        <EuiSpacer size="l" />
      )}

      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false}>
        <EuiFlexItem grow={false}>
          {requiredConsents.map((consent: IConsent) => (
            <ConsentOption
              consent={consent}
              checked={formik.values[consent.agreementName] ?? false}
              onChangeAgreement={onChangeAgreement}
              withoutSpacer
              key={consent.agreementName}
            />
          ))}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            position="top"
            anchorClassName="euiToolTip__btn-disabled"
            content={
              submitIsDisabled() ? (
                <span className="euiToolTip__content">
                  {Object.values(errors).map((err) => [
                    spec?.agreements[err as string]?.requiredText,
                    <br key={err} />,
                  ])}
                </span>
              ) : null
            }
          >
            <EuiButton
              fill
              color="secondary"
              className="btn-add"
              type="submit"
              onClick={() => {}}
              disabled={submitIsDisabled()}
              iconType={submitIsDisabled() ? 'iInCircle' : undefined}
              data-testid="btn-submit"
            >
              Submit
            </EuiButton>
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  )
}

export default ConsentsSettings
