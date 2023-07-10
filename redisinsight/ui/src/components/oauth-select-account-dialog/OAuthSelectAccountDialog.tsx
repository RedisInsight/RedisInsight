import React, { useCallback } from 'react'
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { useHistory } from 'react-router-dom'

import {
  activateAccount,
  createFreeDb,
  createFreeDbSuccess,
  oauthCloudSelector,
  oauthCloudUserDataSelector,
  setSelectAccountDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { Nullable } from 'uiSrc/utils'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

interface FormValues {
  accountId: Nullable<string>
}

const OAuthSelectAccountDialog = () => {
  const { isAutodiscoverySSO } = useSelector(cloudSelector)
  const { accounts = [], id } = useSelector(oauthCloudUserDataSelector) ?? {}
  const { isOpenSelectAccountDialog } = useSelector(oauthCloudSelector)

  const history = useHistory()
  const dispatch = useDispatch()

  const initialValues = {
    accountId: `${id}`,
  }

  const formik = useFormik({
    initialValues,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const onSubmit = ({ accountId }: FormValues) => {
    dispatch(activateAccount(accountId || '', onActivateAccountSuccess, onActivateAccountFail))
  }

  const onActivateAccountSuccess = useCallback(() => {
    dispatch(createFreeDb(() => dispatch(createFreeDbSuccess(history))))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_SELECTED,
      eventData: {
        action: isAutodiscoverySSO ? 'import' : 'create',
        accountsCount: accounts.length
      },
    })
  }, [isAutodiscoverySSO, accounts])

  const onActivateAccountFail = useCallback((error: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FAILED,
      eventData: {
        error,
        accountsCount: accounts.length,
      },
    })
  }, [accounts])

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FORM_CLOSED,
      eventData: { accountsCount: accounts.length },
    })

    dispatch(setSelectAccountDialogState(false))
  }, [accounts])

  if (accounts.length < 2 || !isOpenSelectAccountDialog) return null

  const handleChangeAccountIdFormat = (value: string) => {
    formik.setFieldValue('accountId', value)
  }

  const radios: EuiRadioGroupOption[] = accounts.map(
    ({ id, name = '' }) => ({
      id: `${id}`,
      label: <EuiTextColor className={styles.label}>{name}<span>{id}</span></EuiTextColor>
    })
  )

  return (
    <EuiModal className={styles.container} onClose={handleOnClose} data-testid="oauth-select-account-dialog">
      <EuiModalBody className={styles.modalBody}>
        <section className={styles.content}>
          <EuiTitle size="s">
            <h3 className={styles.title}>Connect to Redis Cloud</h3>
          </EuiTitle>
          <EuiText className={styles.subTitle}>
            Select a Redis Cloud account to connect to:
          </EuiText>
          <EuiRadioGroup
            options={radios}
            className={styles.radios}
            idSelected={formik.values.accountId ?? ''}
            onChange={(id) => handleChangeAccountIdFormat(id)}
            name="radio accounts group"
          />
        </section>
        <div className={styles.footer}>
          <EuiButton
            className={styles.button}
            onClick={handleOnClose}
            data-testid="close-oauth-select-account-dialog"
            aria-labelledby="close oauth select account dialog"
          >
            Cancel
          </EuiButton>
          <EuiButton
            fill
            color="secondary"
            // isDisabled={loading}
            className={styles.button}
            onClick={() => formik.handleSubmit()}
            data-testid="submit-oauth-select-account-dialog"
            aria-labelledby="submit oauth select account dialog"
          >
            Select account
          </EuiButton>
        </div>
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSelectAccountDialog
