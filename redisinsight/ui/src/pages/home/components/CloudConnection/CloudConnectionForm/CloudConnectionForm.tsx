import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useFormik, FormikErrors } from 'formik'
import { isEmpty } from 'lodash'
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiText,
  EuiTitle,
  EuiToolTip,
  EuiWindowEvent,
  keys,
} from '@elastic/eui'

import { validateField } from 'uiSrc/utils/validations'
import validationErrors from 'uiSrc/constants/validationErrors'
import { FeatureFlagComponent, OAuthSocial, OAuthSocialType } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { ICloudConnectionSubmit } from '../CloudConnectionFormWrapper'

import styles from '../styles.module.scss'

export interface Props {
  accessKey: string
  secretKey: string
  flexGroupClassName: string
  flexItemClassName: string
  onClose?: () => void
  onSubmit: ({ accessKey, secretKey }: ICloudConnectionSubmit) => void
  loading: boolean
}

interface ISubmitButton {
  onClick: () => void;
  submitIsDisabled: boolean;
}

interface Values {
  accessKey: string;
  secretKey: string;
}

const fieldDisplayNames: Values = {
  accessKey: 'Enter API Account Key',
  secretKey: 'Enter API User Key',
}

const Message = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <EuiTitle className={styles.messageTitle}><h4>Use Cloud API key</h4></EuiTitle>
    </FeatureFlagComponent>
    <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
      {`Enter API keys to discover and add databases.
    API keys can be enabled by following the steps
    mentioned in the `}
      <EuiLink
        color="text"
        className={styles.link}
        external={false}
        target="_blank"
        href="https://docs.redis.com/latest/rc/api/get-started/manage-api-keys/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
      >
        documentation.
      </EuiLink>
    </EuiText>
  </>
)

const CloudConnectionForm = (props: Props) => {
  const {
    accessKey,
    secretKey,
    flexGroupClassName,
    flexItemClassName,
    onClose,
    onSubmit,
    loading,
  } = props

  const [domReady, setDomReady] = useState(false)
  const [errors, setErrors] = useState<FormikErrors<Values>>(
    accessKey || secretKey ? {} : fieldDisplayNames
  )

  useEffect(() => {
    setDomReady(true)
  }, [])

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    Object.entries(values).forEach(
      ([key, value]) => !value && Object.assign(errs, { [key]: fieldDisplayNames[key] })
    )

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: {
      accessKey,
      secretKey,
    },
    validate,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const submitIsEnable = () => isEmpty(errors)

  const onKeyDown = (event: any) => {
    if (event.key === keys.ENTER && submitIsEnable()) {
      formik.submitForm()
      event.stopPropagation()
    }
  }

  const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <EuiButton
      color="secondary"
      className="btn-cancel"
      onClick={onClick}
      style={{ marginRight: '20px' }}
    >
      Cancel
    </EuiButton>
  )

  const SubmitButton = ({ onClick, submitIsDisabled }: ISubmitButton) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled ? validationErrors.REQUIRED_TITLE(Object.values(errors).length) : null
      }
      content={
        submitIsDisabled ? (
          <span className="euiToolTip__content">
            {Object.values(errors).map((err) => [err, <br key={err} />])}
          </span>
        ) : null
      }
    >
      <EuiButton
        fill
        color="secondary"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        isLoading={loading}
        iconType={submitIsDisabled ? 'iInCircle' : undefined}
        data-testid="btn-submit"
      >
        Submit
      </EuiButton>
    </EuiToolTip>
  )

  const Footer = () => {
    if (!domReady) return null

    const footerEl = document.getElementById('footerDatabaseForm')
    if (footerEl) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          {onClose && <CancelButton onClick={onClose} />}
          <SubmitButton onClick={formik.submitForm} submitIsDisabled={!submitIsEnable()} />
        </div>,
        footerEl
      )
    }
    return null
  }

  return (
    <>
      <div className="getStartedForm">
        <FeatureFlagComponent name={FeatureFlags.cloudSso}>
          <OAuthSocial type={OAuthSocialType.Autodiscovery} />
          <div className={styles.divider}>OR</div>
        </FeatureFlagComponent>
        <div className={styles.cloudApi}>
          <Message />
          <br />
          <EuiWindowEvent event="keydown" handler={onKeyDown} />
          <EuiForm component="form" onSubmit={formik.handleSubmit}>
            <EuiFlexGroup className={flexGroupClassName}>
              <EuiFlexItem className={flexItemClassName}>
                <EuiFormRow label="API Account Key*">
                  <EuiFieldText
                    name="accessKey"
                    id="accessKey"
                    data-testid="access-key"
                    maxLength={200}
                    placeholder={fieldDisplayNames.accessKey}
                    value={formik.values.accessKey}
                    autoComplete="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(e.target.name, validateField(e.target.value.trim()))
                    }}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup className={flexGroupClassName}>
              <EuiFlexItem className={flexItemClassName}>
                <EuiFormRow label="API User Key*">
                  <EuiFieldText
                    name="secretKey"
                    id="secretKey"
                    data-testid="secret-key"
                    maxLength={200}
                    placeholder={fieldDisplayNames.secretKey}
                    value={formik.values.secretKey}
                    autoComplete="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(e.target.name, validateField(e.target.value.trim()))
                    }}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <Footer />
          </EuiForm>
        </div>
      </div>
    </>
  )
}

export default CloudConnectionForm
