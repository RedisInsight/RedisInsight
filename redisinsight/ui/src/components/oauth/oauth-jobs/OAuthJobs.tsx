import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { CloudJobStatus, CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { createFreeDbSuccess, oauthCloudJobSelector, oauthCloudSelector, setJob, showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { parseCloudOAuthError } from 'uiSrc/utils'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'

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
        dispatch(setJob({ id: '', name: CloudJobName.CreateFreeDatabase, status: '' }))
        break

      case CloudJobStatus.Failed:
        const err = parseCloudOAuthError(error || '')
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
        dispatch(addErrorNotification(err))
        break

      default:
        break
    }
  }, [status, error, step, resourceId, showProgress])

  return null
}

export default OAuthJobs
