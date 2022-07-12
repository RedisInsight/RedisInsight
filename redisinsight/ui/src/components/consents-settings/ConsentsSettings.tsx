import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty } from 'lodash'
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
} from '@elastic/eui'
import { EuiSwitchEvent } from '@elastic/eui/src/components/form/switch'
import cx from 'classnames'

import { compareConsents } from 'uiSrc/utils'
import { updateUserConfigSettingsAction, userSettingsSelector } from 'uiSrc/slices/user/user-settings'
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

    consents.forEach((consent) => {
      if (!consent.required) {
        formik.setFieldValue(consent.agreementName, true)
      }
    })
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
    setRequiredConsents(consents.filter(
      (consent: IConsent) => consent.required
    ))
    setPrivacyConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === 'privacy'
    ))
    setNotificationConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === 'notifications'
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

  const onChangeAgreement = (checked: boolean, name: string, independent?: boolean) => {
    formik.setFieldValue(name, checked)
    if (!independent) {
      setIsRecommended(false)
    }
  }

  const submitForm = (values: any) => {
    if (submitIsDisabled()) {
      return
    }
    dispatch(updateUserConfigSettingsAction({ agreements: values }, onSubmitted))
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <EuiCallOut>
          <EuiText size="s" data-testid="plugin-section">
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
              <EuiText size="s" color="subdued" style={{ marginTop: '1em' }}>
                Select to activate all listed options.
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiHorizontalRule margin="l" className={cx({ [styles.pluginWarningHR]: !!requiredConsents.length })} />
        {!!privacyConsents.length && (
          <>
            <EuiSpacer size="l" />
            <EuiTitle size="m">
              <h1 className={styles.title}>Privacy Settings</h1>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiText size="s" color="subdued">
              To optimize your experience, RedisInsight uses third-party tools.
              All data collected is anonymized and will not be used for any purpose without your consent.
            </EuiText>
            <EuiSpacer size="xl" />
          </>
        )}
        {
          privacyConsents
            .map((consent: IConsent) => (
              <ConsentOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
              />
            ))
        }
        {!!notificationConsents.length && (
          <>
            <EuiTitle size="m">
              <h1 className={styles.title}>Notifications</h1>
            </EuiTitle>
            <EuiSpacer size="xl" />
          </>
        )}
        {
          notificationConsents
            .map((consent: IConsent) => (
              <ConsentOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
              />
            ))
        }
      </div>
      {!!requiredConsents.length && (
        <>
          <EuiHorizontalRule margin="l" className={cx({ [styles.pluginWarningHR]: !!requiredConsents.length })} />
          <EuiSpacer size="l" />
          <EuiText color="subdued" size="s">
            To use RedisInsight, please accept the terms and conditions:
          </EuiText>
          <EuiSpacer size="m" />
        </>
      )}

      {requiredConsents.map((consent: IConsent) => (
        <ConsentOption
          consent={consent}
          checked={formik.values[consent.agreementName] ?? false}
          onChangeAgreement={onChangeAgreement}
          independent
        />
      ))}
      {!requiredConsents.length && (<EuiSpacer size="l" />)}
      <EuiFlexGroup justifyContent="flexEnd" responsive={false}>
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
