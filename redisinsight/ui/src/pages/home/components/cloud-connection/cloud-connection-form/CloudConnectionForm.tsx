import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty } from 'lodash'
import { EuiFieldText, EuiForm, EuiRadioGroup, keys } from '@elastic/eui'

import { useSelector } from 'react-redux'
import { validateField } from 'uiSrc/utils/validations'
import validationErrors from 'uiSrc/constants/validationErrors'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { CloudConnectionOptions } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthAutodiscovery } from 'uiSrc/components/oauth/oauth-sso'
import { MessageCloudApiKeys } from 'uiSrc/pages/home/components/form/Messages'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Text } from 'uiSrc/components/base/text'
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
  const { accessKey, secretKey, onClose, onSubmit, loading } = props

  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const [domReady, setDomReady] = useState(false)
  const [errors, setErrors] = useState<FormikErrors<Values>>(
    accessKey || secretKey ? {} : fieldDisplayNames,
  )
  const [type, setType] = useState<CloudConnectionOptions>(
    cloudSsoFeature?.flag
      ? CloudConnectionOptions.Account
      : CloudConnectionOptions.ApiKeys,
  )

  useEffect(() => {
    setDomReady(true)
  }, [])

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    Object.entries(values).forEach(
      ([key, value]) =>
        !value && Object.assign(errs, { [key]: fieldDisplayNames[key] }),
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

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === keys.ENTER && submitIsEnable()) {
      formik.submitForm()
      event.stopPropagation()
    }
  }

  const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <SecondaryButton
      size="s"
      className="btn-cancel"
      onClick={onClick}
      style={{ marginRight: 12 }}
    >
      Cancel
    </SecondaryButton>
  )

  const SubmitButton = ({ onClick, submitIsDisabled }: ISubmitButton) => (
    <RiTooltip
      position="top"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.values(errors).length)
          : null
      }
      content={
        submitIsDisabled ? (
          <span className="euiToolTip__content">
            {Object.values(errors).map((err) => [err, <br key={err} />])}
          </span>
        ) : null
      }
    >
      <PrimaryButton
        size="s"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={loading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        Submit
      </PrimaryButton>
    </RiTooltip>
  )

  const Footer = () => {
    if (!domReady) return null

    const footerEl = document.getElementById('footerDatabaseForm')
    if (footerEl) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          {onClose && <CancelButton onClick={onClose} />}
          <SubmitButton
            onClick={formik.submitForm}
            submitIsDisabled={!submitIsEnable()}
          />
        </div>,
        footerEl,
      )
    }
    return null
  }

  const CloudApiForm = (
    <div className={styles.cloudApi} data-testid="add-db_cloud-api">
      <MessageCloudApiKeys />
      <Spacer />
      <WindowEvent event="keydown" handler={onKeyDown} />
      <EuiForm component="form" onSubmit={formik.handleSubmit}>
        <Row responsive>
          <FlexItem>
            <FormField label="API Account Key*">
              <EuiFieldText
                name="accessKey"
                id="accessKey"
                data-testid="access-key"
                maxLength={200}
                placeholder={fieldDisplayNames.accessKey}
                value={formik.values.accessKey}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim()),
                  )
                }}
              />
            </FormField>
          </FlexItem>
        </Row>
        <Row responsive>
          <FlexItem grow>
            <FormField label="API User Key*">
              <EuiFieldText
                name="secretKey"
                id="secretKey"
                data-testid="secret-key"
                maxLength={200}
                placeholder={fieldDisplayNames.secretKey}
                value={formik.values.secretKey}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim()),
                  )
                }}
              />
            </FormField>
          </FlexItem>
        </Row>
        <Footer />
      </EuiForm>
    </div>
  )

  return (
    <div className="getStartedForm eui-yScroll">
      <FeatureFlagComponent name={FeatureFlags.cloudSso}>
        <Col gap="s">
          <FlexItem grow>
            <Text color="subdued" size="s">
              Connect with:
            </Text>
          </FlexItem>
          <FlexItem grow>
            <EuiRadioGroup
              options={options}
              idSelected={type}
              className={styles.cloudOptions}
              onChange={(id) => setType(id as CloudConnectionOptions)}
              data-testid="cloud-options"
            />
          </FlexItem>
        </Col>
        <Spacer size="s" />
      </FeatureFlagComponent>
      {type === CloudConnectionOptions.Account && (
        <OAuthAutodiscovery
          source={OAuthSocialSource.DiscoveryForm}
          onClose={onClose}
        />
      )}
      {type === CloudConnectionOptions.ApiKeys && CloudApiForm}
    </div>
  )
}

export default CloudConnectionForm
