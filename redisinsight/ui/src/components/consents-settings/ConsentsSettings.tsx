import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormikErrors, useFormik } from 'formik'
import { has, isEmpty } from 'lodash'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSwitch,
  EuiSpacer,
  EuiText,
  EuiButton,
  EuiToolTip,
  EuiForm,
  EuiHorizontalRule,
  EuiCallOut,
} from '@elastic/eui'
import cx from 'classnames'
import parse from 'html-react-parser'

import { compareConsents } from 'uiSrc/utils'
import { updateUserConfigSettingsAction, userSettingsSelector } from 'uiSrc/slices/user/user-settings'

import styles from './styles.module.scss'

interface Values {
  [key: string]: string;
}

export interface IConsent {
  defaultValue: boolean;
  displayInSetting: boolean;
  required: boolean;
  editable: boolean;
  disabled: boolean,
  since: string;
  title: string;
  label: string;
  agreementName: string;
  description?: string;
}

export interface Props {
  liveEditMode?: boolean;
}

const ConsentsSettings = ({ liveEditMode = false }: Props) => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [requiredConsents, setRequiredConsents] = useState<IConsent[]>([])
  const [nonRequiredConsents, setNonRequiredConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<any>({})
  const [errors, setErrors] = useState<FormikErrors<Values>>({})

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

  const formik = useFormik({
    initialValues,
    validate: !liveEditMode ? validate : undefined,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements, liveEditMode))
    }
  }, [spec, config])

  useEffect(() => {
    setRequiredConsents(consents.filter(
      (consent: IConsent) => consent.required && (liveEditMode ? consent.displayInSetting : true)
    ))
    setNonRequiredConsents(consents.filter(
      (consent: IConsent) => !consent.required && (liveEditMode ? consent.displayInSetting : true)
    ))
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({ ...acc, [cur.agreementName]: cur.defaultValue }),
        {}
      )

      if (liveEditMode && config) {
        Object.keys(values).forEach((value) => {
          if (has(config.agreements, value)) {
            values[value] = config?.agreements?.[value]
          }
        })
      }
      setInitialValues(values)
    }
  }, [consents])

  useEffect(() => {
    !liveEditMode && formik.validateForm(initialValues)
  }, [requiredConsents])

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
    liveEditMode && formik.submitForm()
  }

  const submitForm = (values: any) => {
    if (submitIsDisabled()) {
      return
    }
    dispatch(updateUserConfigSettingsAction({ agreements: values }))
  }

  const renderConsentOption = (consent: IConsent, withHR = false) => (
    <EuiFlexItem key={consent.agreementName}>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiSwitch
            showLabel={false}
            label=""
            checked={formik.values[consent.agreementName] ?? false}
            onChange={(e) => onChangeAgreement(e.target.checked, consent.agreementName)}
            className={styles.switchOption}
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText className={styles.label}>{parse(consent.label)}</EuiText>
          {consent.description && (
            <EuiText size="s" color="subdued" style={{ marginTop: '1em' }}>
              {consent.description}
            </EuiText>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      {withHR ? <EuiHorizontalRule margin="l" /> : <EuiSpacer size="xl" />}
    </EuiFlexItem>
  )

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        {!!nonRequiredConsents.length && (
          <>
            <EuiSpacer size="s" />
            <EuiText size="s" color="subdued">
              To improve your experience, we use third party tools in RedisInsight. All data collected
              are completely anonymized, but we will not use these data for any purpose that you do
              not consent to.
            </EuiText>
            <EuiSpacer size="xl" />
          </>
        )}
        {
          nonRequiredConsents
            .map((consent: IConsent) => renderConsentOption(consent, nonRequiredConsents.length > 1))
        }

        {!liveEditMode && (
          <>
            <EuiCallOut>
              <EuiText size="s" data-testid="plugin-section">
                While adding new visualization plugins, use files only from trusted authors
                to avoid automatic execution of malicious code.
              </EuiText>
            </EuiCallOut>
            <EuiHorizontalRule margin="l" className={cx({ [styles.pluginWarningHR]: !!requiredConsents.length })} />
          </>
        )}
      </div>
      {!!requiredConsents.length && (
        <>
          <EuiSpacer size="l" />
          <EuiText color="subdued" size="s">
            To use RedisInsight, please accept the terms and conditions:
          </EuiText>
          <EuiSpacer size="m" />
        </>
      )}

      {requiredConsents.map((consent: IConsent) => renderConsentOption(consent))}

      {!liveEditMode && (
        <>
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
                  color="success"
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
        </>
      )}
    </EuiForm>
  )
}

export default ConsentsSettings
