import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { get } from 'lodash'

import { CloudJobStatus, CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { createFreeDbJob, createFreeDbSuccess, oauthCloudJobSelector, oauthCloudSelector, setJob } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { parseCloudOAuthError } from 'uiSrc/utils'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { CustomErrorCodes } from 'uiSrc/constants'

const OAuthJobs = () => {
  const {
    status,
    error,
    step,
    result: { resourceId = '' } = {},
  } = useSelector(oauthCloudJobSelector) ?? {}
  const { showProgress } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    switch (status) {
      case CloudJobStatus.Running:
        if (!showProgress) return

        dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(step as CloudJobStep)))
        break

      case CloudJobStatus.Finished:
        dispatch(fetchInstancesAction(() => dispatch(createFreeDbSuccess(resourceId, history))))
        dispatch(setJob({ id: '', name: CloudJobName.CreateFreeSubscriptionAndDatabase, status: '' }))
        break

      case CloudJobStatus.Failed:

        const errorCode = get(error, 'errorCode', 0) as CustomErrorCodes
        const subscriptionId = get(error, 'resource.subscriptionId', 0)
        const databaseId = get(error, 'resource.databaseId', 0)
        // eslint-disable-next-line sonarjs/no-nested-switch
        switch (errorCode) {
          case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
            dispatch(addInfiniteNotification(
              INFINITE_MESSAGES.DATABASE_EXISTS(
                () => importDatabase(subscriptionId, databaseId),
                closeImportDatabase,
              )
            ))

            break

          case CustomErrorCodes.CloudSubscriptionAlreadyExistsFree:
            dispatch(addInfiniteNotification(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(
              () => createFreeDatabase(subscriptionId),
              closeCreateFreeDatabase,
            )))
            break

          default:
            const err = parseCloudOAuthError(error || '')
            dispatch(addErrorNotification(err))
            break
        }

        dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
        break

      default:
        break
    }
  }, [status, error, step, resourceId, showProgress])

  const importDatabase = (subscriptionId: number, databaseId: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE,
    })
    dispatch(createFreeDbJob({
      name: CloudJobName.ImportFreeDatabase,
      resources: { subscriptionId, databaseId },
      onSuccessAction: () => {
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.databaseExists))
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)))
      }
    }))
  }

  const createFreeDatabase = (subscriptionId: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION,
    })
    dispatch(createFreeDbJob({
      name: CloudJobName.CreateFreeDatabase,
      resources: { subscriptionId },
      onSuccessAction: () => {
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.subscriptionExists))
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)))
      }
    }))
  }

  const closeImportDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
    })
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.databaseExists))
  }

  const closeCreateFreeDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
    })
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.subscriptionExists))
  }

  return null
}

export default OAuthJobs
