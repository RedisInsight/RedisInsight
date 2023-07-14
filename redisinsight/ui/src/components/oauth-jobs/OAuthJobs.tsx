import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { CloudJobStatus, CloudJobs } from 'uiSrc/electron/constants'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { createFreeDbSuccess, oauthCloudJobSelector, setJob } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { parseCloudOAuthError } from 'uiSrc/utils'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from '../notifications/components'

const OAuthJobs = () => {
  const { status, result = {}, error } = useSelector(oauthCloudJobSelector) ?? {}
  const prevStatusRef = useRef(status)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    switch (status) {
      case CloudJobStatus.Running:
        if (status !== prevStatusRef.current) {
          dispatch(addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB))
        }
        break

      case CloudJobStatus.Finished:
        const dbId = result?.resourceId || ''
        dispatch(fetchInstancesAction(() => dispatch(createFreeDbSuccess(dbId, history))))
        dispatch(setJob({ id: '', name: CloudJobs.CREATE_FREE_DATABASE, status: '' }))
        break

      case CloudJobStatus.Failed:
        const err = parseCloudOAuthError(error || '')
        dispatch(setJob({ id: '', name: CloudJobs.CREATE_FREE_DATABASE, status: '' }))
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuth))
        dispatch(addErrorNotification(err))
        break

      default:
        break
    }
    prevStatusRef.current = status
  }, [status, error, result])

  return null
}

export default OAuthJobs
