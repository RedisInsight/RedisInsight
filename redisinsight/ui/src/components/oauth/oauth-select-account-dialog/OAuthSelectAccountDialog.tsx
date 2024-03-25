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
  createFreeDbJob,
  fetchPlans,
  oauthCloudPlanSelector,
  oauthCloudSelector,
  oauthCloudUserDataSelector,
  oauthCloudUserSelector,
  setSelectAccountDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { Nullable } from 'uiSrc/utils'
import { cloudSelector, fetchSubscriptionsRedisCloud } from 'uiSrc/slices/instances/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

interface FormValues {
  accountId: Nullable<string>
}

const OAuthSelectAccountDialog = () => {
  const { ssoFlow, isRecommendedSettings } = useSelector(cloudSelector)
  const { accounts = [], currentAccountId } = useSelector(oauthCloudUserDataSelector) ?? {}
  const { isOpenSelectAccountDialog } = useSelector(oauthCloudSelector)
  const { loading } = useSelector(oauthCloudUserSelector)
  const { loading: plansLoadings } = useSelector(oauthCloudPlanSelector)

  const isAutodiscoverySSO = ssoFlow === OAuthSocialAction.Import

  const history = useHistory()
  const dispatch = useDispatch()

  const initialValues = {
    accountId: `${currentAccountId}`,
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
    if (isAutodiscoverySSO) {
      dispatch(fetchSubscriptionsRedisCloud(
        null,
        true,
        () => {
          dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
          history.push(Pages.redisCloudSubscriptions)
        },
        () => {
          dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
        }
      ))
      dispatch(setSelectAccountDialogState(false))
    } else if (isRecommendedSettings) {
      dispatch(createFreeDbJob({
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        resources: {
          isRecommendedSettings
        },
        onSuccessAction: () => {
          dispatch(setSelectAccountDialogState(false))
          dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)))
        },
        onFailAction: () => {
          dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
        }
      }))
    } else {
      dispatch(fetchPlans())
    }

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_SELECTED,
      eventData: {
        action: ssoFlow,
        accountsCount: accounts.length
      },
    })
  }, [isAutodiscoverySSO, isRecommendedSettings, accounts])

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
            Select an account to connect to:
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
            isDisabled={loading || plansLoadings}
            isLoading={loading || plansLoadings}
            color="secondary"
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
