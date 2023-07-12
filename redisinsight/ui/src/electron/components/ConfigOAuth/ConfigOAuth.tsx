import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  createFreeDbJob,
  fetchUserInfo,
  oauthCloudUserDataSelector,
  setJob,
  setSignInDialogState,
  signInFailure,
} from 'uiSrc/slices/oauth/cloud'
import { Pages } from 'uiSrc/constants'
import { cloudSelector, fetchSubscriptionsRedisCloud, setIsAutodiscoverySSO } from 'uiSrc/slices/instances/cloud'
import { CloudAuthResponse, CloudAuthStatus, CloudJobStatus, CloudJobs } from 'uiSrc/electron/constants'
import { addErrorNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { parseCloudOAuthCallbackError } from 'uiSrc/utils'
import { InfiniteMessagesIds } from 'uiSrc/components/notifications/components'

const ConfigOAuth = () => {
  const { isAutodiscoverySSO } = useSelector(cloudSelector)
  const userData = useSelector(oauthCloudUserDataSelector)

  const isAutodiscoverySSORef = useRef(isAutodiscoverySSO)

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    window.app?.cloudOauthCallback?.(cloudOauthCallback)

    // delete
    // dispatch(fetchUserInfo(fetchUserInfoSuccess))
  }, [])

  useEffect(() => {
    console.log({ userData })
  }, [userData])

  useEffect(() => {
    isAutodiscoverySSORef.current = isAutodiscoverySSO
  }, [isAutodiscoverySSO])

  const fetchUserInfoSuccess = (isMultiAccount: boolean) => {
    if (isMultiAccount) return

    if (isAutodiscoverySSORef.current) {
      dispatch(fetchSubscriptionsRedisCloud(
        null,
        () => {
          closeInfinityNotification()
          history.push(Pages.redisCloudSubscriptions)
        },
        closeInfinityNotification,
      ))
    } else {
      dispatch(createFreeDbJob(() => {}, closeInfinityNotification))
    }
  }

  const closeInfinityNotification = () => {
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuth))
  }

  const cloudOauthCallback = (_e: any, { status, message = '', error }: CloudAuthResponse) => {
    if (status === CloudAuthStatus.Succeed) {
      dispatch(setJob({ id: '', status: CloudJobStatus.Running, name: CloudJobs.CREATE_FREE_DATABASE }))
      dispatch(setSignInDialogState(null))
      dispatch(fetchUserInfo(fetchUserInfoSuccess, closeInfinityNotification))
    }

    if (status === CloudAuthStatus.Failed) {
      const err = parseCloudOAuthCallbackError(error || message || '')
      dispatch(signInFailure(err?.message))
      dispatch(addErrorNotification(err))
      dispatch(setIsAutodiscoverySSO(false))
    }
  }

  return null
}

export default ConfigOAuth
