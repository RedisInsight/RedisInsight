import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { CloudAuthStatus } from 'uiSrc/electron/constants/cloudAuth'
import { INFINITE_MESSAGES, InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { createAxiosError } from 'uiSrc/utils'
import { loadMicrosoftAuthSessionSuccess } from 'uiSrc/slices/instances/microsoftAuthSession'

export interface MicrosoftAuthResponse {
  status: CloudAuthStatus
  username?: string
  password?: string
  error?: {
    message: string
  }
  action?: string
  databaseId?: string
}

const ConfigMicrosoftAuth = () => {
  const isAuthInProgress = useRef(false)
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    window.app?.microsoftAuthCallback?.((e: any, response: MicrosoftAuthResponse) =>
      handleMicrosoftAuthCallback(e, response, 'autodiscovery'))
    window.app?.microsoftAuthEditCallback?.((e: any, response: MicrosoftAuthResponse) =>
      handleMicrosoftAuthCallback(e, response, 'edit'))
  }, [])

  const closeInfinityNotification = () => {
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
  }

  const handleMicrosoftAuthCallback = (_e: any, response: MicrosoftAuthResponse, action: 'autodiscovery' | 'edit') => {
    if (response.status === CloudAuthStatus.Succeed) {
      if (isAuthInProgress.current) {
        return
      }
      isAuthInProgress.current = true
      if (response.username && response.password) {
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()))
        closeInfinityNotification()

        // Update the microsoft_auth_session table for both autodiscovery and edit cases
        if (action === 'edit' && response.databaseId) {
          const sessionData = {
            id: response.databaseId,
            username: response.username,
            displayName: response.username, // Using username as display name if not provided
            lastUpdated: Date.now(),
            // Add any additional fields from the response if available
            ...(response.action && { action: response.action })
          }

          // Dispatch action to update the session
          dispatch(loadMicrosoftAuthSessionSuccess({
            databaseId: response.databaseId,
            data: {
              ...sessionData,
              authenticated: true
            }
          }))
        }

        if (action === 'autodiscovery') {
          history.push(Pages.azureSubscriptions)
        }
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
