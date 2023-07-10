import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  createFreeDb,
  createFreeDbSuccess,
  fetchUserInfo,
  oauthCloudUserDataSelector,
  signInFailure,
  signInSuccess,
} from 'uiSrc/slices/oauth/cloud'
import { Pages } from 'uiSrc/constants'
import { cloudSelector, fetchSubscriptionsRedisCloud, setIsAutodiscoverySSO } from 'uiSrc/slices/instances/cloud'
import { CloudAuthResponse, CloudAuthStatus } from 'uiSrc/electron/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { parseCloudOAuthCallbackError } from 'uiSrc/utils'

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
        () => history.push(Pages.redisCloudSubscriptions)
      ))
    } else {
      dispatch(createFreeDb(() => dispatch(createFreeDbSuccess(history))))
    }
  }

  const cloudOauthCallback = (_e: any, { status, message = '', error }: CloudAuthResponse) => {
    if (status === CloudAuthStatus.Succeed) {
      dispatch(signInSuccess(message))
      dispatch(fetchUserInfo(fetchUserInfoSuccess))
    }

    if (status === CloudAuthStatus.Failed) {
      const err = parseCloudOAuthCallbackError(error)
      dispatch(signInFailure(err?.message))
      dispatch(addErrorNotification(err))
      dispatch(setIsAutodiscoverySSO(false))
    }
  }

  return null
}

export default ConfigOAuth
