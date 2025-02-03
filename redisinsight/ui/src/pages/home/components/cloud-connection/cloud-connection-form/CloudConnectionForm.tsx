import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty } from 'lodash'
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiRadioGroup,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  EuiWindowEvent,
  keys,
} from '@elastic/eui'

import { useSelector } from 'react-redux'
import { validateField } from 'uiSrc/utils/validations'
import validationErrors from 'uiSrc/constants/validationErrors'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { CloudConnectionOptions } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthAutodiscovery } from 'uiSrc/components/oauth/oauth-sso'
import { MessageCloudApiKeys } from 'uiSrc/pages/home/components/form/Messages'
import { ICloudConnectionSubmit } from '../CloudConnectionFormWrapper'

import styles from '../styles.module.scss'

export interface Props {
  accessKey: string
  secretKey: string
  onClose?: () => void
  onSubmit: ({ accessKey, secretKey }: ICloudConnectionSubmit) => void
  loading: boolean
}

interface ISubmitButton {
  onClick: () => void
  submitIsDisabled: boolean
}

interface Values {
  accessKey: string
  secretKey: string
}

const fieldDisplayNames: Values = {
  accessKey: 'Enter API Account Key',
  secretKey: 'Enter API User Key',
}

const options = [
  { id: CloudConnectionOptions.Account, label: 'Redis Cloud account' },
  { id: CloudConnectionOptions.ApiKeys, label: 'Redis Cloud API keys' },
]

const CloudConnectionForm = (props: Props) => {
  const {
    accessKey,
    secretKey,
    onClose,
    onSubmit,
    loading,
  } = props

  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useSelector(appFeatureFlagsFeaturesSelector)

  const [domReady, setDomReady] = useState(false)
  const [errors, setErrors] = useState<FormikErrors<Values>>(
    accessKey || secretKey ? {} : fieldDisplayNames
  )
  const [type, setType] = useState<CloudConnectionOptions>(
    cloudSsoFeature?.flag ? CloudConnectionOptions.Account : CloudConnectionOptions.ApiKeys
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
      size="s"
      color="secondary"
      className="btn-cancel"
      onClick={onClick}
      style={{ marginRight: 12 }}
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
        size="s"
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

  const CloudApiForm = (
    <div className={styles.cloudApi} data-testid="add-db_cloud-api">
      <MessageCloudApiKeys />
      <EuiSpacer />
      <EuiWindowEvent event="keydown" handler={onKeyDown} />
      <EuiForm component="form" onSubmit={formik.handleSubmit}>
        <EuiFlexGroup>
          <EuiFlexItem>
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
        <EuiFlexGroup>
          <EuiFlexItem>
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
  )

  return (
    <div className="getStartedForm eui-yScroll">
      <FeatureFlagComponent name={FeatureFlags.cloudSso}>
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem><EuiText color="subdued" size="s">Connect with:</EuiText></EuiFlexItem>
          <EuiFlexItem>
            <EuiRadioGroup
              options={options}
              idSelected={type}
              className={styles.cloudOptions}
              onChange={(id) => setType(id as CloudConnectionOptions)}
              data-testid="cloud-options"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
      </FeatureFlagComponent>
      {type === CloudConnectionOptions.Account && (
        <OAuthAutodiscovery source={OAuthSocialSource.DiscoveryForm} onClose={onClose} />
      )}
      {type === CloudConnectionOptions.ApiKeys && CloudApiForm}
    </div>
  )
}

export default CloudConnectionForm
