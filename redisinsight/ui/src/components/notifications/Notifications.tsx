import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiGlobalToastList,
  EuiButton,
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiTextColor,
} from '@elastic/eui'
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import cx from 'classnames'
import {
  errorsSelector,
  infiniteNotificationsSelector,
  messagesSelector,
  removeInfiniteNotification,
  removeMessage,
} from 'uiSrc/slices/app/notifications'
import { setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { IError, IMessage, InfiniteMessage } from 'uiSrc/slices/interfaces'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { CustomErrorCodes } from 'uiSrc/constants'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'

import errorMessages from './error-messages'
import { InfiniteMessagesIds } from './components'

import styles from './styles.module.scss'

const Notifications = () => {
  const messagesData = useSelector(messagesSelector)
  const errorsData = useSelector(errorsSelector)
  const infiniteNotifications = useSelector(infiniteNotificationsSelector)

  const dispatch = useDispatch()

  const removeToast = ({ id }: Toast) => {
    dispatch(removeMessage(id))
  }

  const onSubmitNotification = ({ id }: Toast, group?: string) => {
    if (group === 'upgrade') {
      dispatch(setReleaseNotesViewed(true))
    }
    dispatch(removeMessage(id))
  }

  const getSuccessText = (
    text: string | JSX.Element | JSX.Element[],
    toast: Toast,
    group?: string
  ) => (
    <>
      <EuiTextColor color="ghost">{text}</EuiTextColor>
      <EuiSpacer />
      <EuiFlexGroup responsive={false} justifyContent="flexEnd" gutterSize="none">
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            size="s"
            onClick={() => onSubmitNotification(toast, group)}
            className={styles.toastSuccessBtn}
            data-testid="submit-tooltip-btn"
          >
            Ok
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )

  const getSuccessToasts = (data: IMessage[]) =>
    data.map(({ id = '', title = '', message = '', className, group }) => {
      const toast: Toast = {
        id,
        iconType: 'iInCircle',
        title: (
          <EuiTextColor color="ghost">
            <b>{title}</b>
          </EuiTextColor>
        ),
        color: 'success',
        className
      }
      toast.text = getSuccessText(message, toast, group)
      toast.onClose = () => removeToast(toast)

      return toast
    })

  const getErrorsToasts = (errors: IError[]) =>
    errors.map(({ id = '', message = DEFAULT_ERROR_MESSAGE, instanceId = '', name, title, additionalInfo }) => {
      if (ApiEncryptionErrors.includes(name)) {
        return errorMessages.ENCRYPTION(id, () => removeToast({ id }), instanceId)
      }

      if (additionalInfo?.errorCode === CustomErrorCodes.CloudCapiKeyUnauthorized) {
        return errorMessages.CLOUD_CAPI_KEY_UNAUTHORIZED(
          { id, message, title },
          additionalInfo,
          () => removeToast({ id })
        )
      }

      if (additionalInfo?.errorCode === CustomErrorCodes.RdiDeployPipelineFailure) {
        return errorMessages.RDI_DEPLOY_PIPELINE(
          { id, title, message },
          () => removeToast({ id })
        )
      }

      return errorMessages.DEFAULT(id, message, () => removeToast({ id }), title)
    })

  const getInfiniteToasts = (data: InfiniteMessage[]): Toast[] => data.map((message: InfiniteMessage) => {
    const { id, Inner, className = '' } = message

    return {
      id,
      className: cx(styles.infiniteMessage, className),
      text: Inner,
      color: 'success',
      onClose: () => {
        switch (id) {
          case InfiniteMessagesIds.oAuthProgress:
            dispatch(showOAuthProgress(false))
            break
          case InfiniteMessagesIds.databaseExists:
            sendEventTelemetry({
              event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
            })
            break
          case InfiniteMessagesIds.subscriptionExists:
            sendEventTelemetry({
              event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
            })
            break
          case InfiniteMessagesIds.appUpdateAvailable:
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
            })
            break

          default:
            break
        }

        dispatch(removeInfiniteNotification(id))
      },
      toastLifeTimeMs: 3_600_000,
    }
  })

  return (
    <EuiGlobalToastList
      toasts={[
        ...getSuccessToasts(messagesData),
        ...getErrorsToasts(errorsData),
        ...getInfiniteToasts(infiniteNotifications),
      ]}
      dismissToast={removeToast}
      toastLifeTimeMs={6000}
    />
  )
}

export default Notifications
