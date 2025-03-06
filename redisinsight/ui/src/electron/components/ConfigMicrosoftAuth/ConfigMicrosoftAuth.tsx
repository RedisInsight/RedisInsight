import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { CloudAuthStatus } from 'uiSrc/electron/constants/cloudAuth'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { createAxiosError } from 'uiSrc/utils'

export interface MicrosoftAuthResponse {
  status: CloudAuthStatus
  username?: string
  password?: string
  error?: {
    message: string
  }
}

const ConfigMicrosoftAuth = () => {
  const isAuthInProgress = useRef(false)
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    window.app?.microsoftAuthCallback?.(microsoftAuthCallback)
  }, [])

  const closeInfinityNotification = () => {
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
  }

  const onAuthSuccess = () => {
    // TODO: Update for the complete flow in follow up PR
    // dispatch(fetchSubscriptionsAzure())
    closeInfinityNotification()
    history.push(Pages.azureSubscriptions)
  }

  const microsoftAuthCallback = (_e: any, response: MicrosoftAuthResponse) => {
    // Handle Microsoft auth callback
    if (response.status === CloudAuthStatus.Succeed) {
      if (isAuthInProgress.current) {
        return
      }
      isAuthInProgress.current = true
      if (response.username && response.password) {
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()))
        onAuthSuccess()
      }
    } else if (response.status === CloudAuthStatus.Failed) {
      dispatch(addErrorNotification(createAxiosError({
        message: response.error?.message || 'Microsoft authentication failed',
      })))

      isAuthInProgress.current = false
    }
  }

  return null
}

export default ConfigMicrosoftAuth
