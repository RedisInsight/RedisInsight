import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/slices/interfaces'
import { ipcAuthMicrosoft } from 'uiSrc/electron/utils/ipcAuth'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { signIn } from 'uiSrc/slices/oauth/cloud'
import { resetDataAzure } from 'uiSrc/slices/instances/microsoftAzure'
import {
  fetchMicrosoftAuthSession,
  resetMicrosoftAuthSession,
  MicrosoftAuthSession
} from 'uiSrc/slices/instances/microsoftAuthSession'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { Pages, ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'

export interface AuthenticationStatus {
  isAuthenticated: boolean;
  userEmail: string | null;
  displayName: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useMicrosoftAuth = (databaseId?: string): [
  AuthenticationStatus,
  () => void, // signIn
  () => Promise<void>, // signOut
  () => Promise<void> // retry
] => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()

  const sessionData = useSelector((state: RootState) => (
    databaseId ? (state.connections.microsoftAuthSession?.data || {})[databaseId] : null
  ))

  const [status, setStatus] = useState<AuthenticationStatus>({
    isAuthenticated: false,
    userEmail: null,
    displayName: null,
    isLoading: true,
    error: null
  })

  const checkAuthenticationStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }))

      if (!databaseId) {
        setStatus((prev) => ({
          ...prev,
          isAuthenticated: false,
          userEmail: null,
          displayName: null,
          isLoading: false
        }))
        return
      }

      // Use our Redux action to fetch the session
      // The Promise returned by dispatch is the action result, not what the thunk returned
      const actionResult = await dispatch(fetchMicrosoftAuthSession(databaseId))
      // The actual session data is attached to the action result by Redux Thunk
      const result = actionResult?.payload?.data as MicrosoftAuthSession

      // Update local state based on the result
      if (result && result.authenticated) {
        setStatus({
          isAuthenticated: true,
          userEmail: result.username,
          displayName: result.displayName,
          isLoading: false,
          error: null
        })
      } else {
        setStatus({
          isAuthenticated: false,
          userEmail: null,
          displayName: null,
          isLoading: false,
          error: result?.error || null
        })
      }
    } catch (error) {
      console.error(`Microsoft auth fetch error for database ${databaseId}:`, error)
      setStatus((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  useEffect(() => {
    checkAuthenticationStatus()
  }, [databaseId])

  useEffect(() => {
    if (sessionData) {
      setStatus({
        isAuthenticated: sessionData.authenticated || false,
        userEmail: sessionData.username || null,
        displayName: sessionData.displayName || null,
        isLoading: false,
        error: sessionData.error || null
      })
    }
  }, [sessionData])

  const handleSignIn = () => {
    if (databaseId) {
      // For database editing, used in direct Microsoft auth without autodiscovery
      ipcAuthMicrosoft(OAuthStrategy.Microsoft, OAuthSocialAction.EditDatabase, {
        databaseId,
        action: OAuthSocialAction.EditDatabase
      })
    } else {
      // For autodiscovery, use the existing flow
      dispatch(setSSOFlow(OAuthSocialAction.SignIn))
      dispatch(signIn())
      ipcAuthMicrosoft(OAuthStrategy.Microsoft, OAuthSocialAction.SignIn)
    }
  }

  const handleSignOut = async () => {
    try {
      if (databaseId) {
        await apiService.post(`${ApiEndpoints.MICROSOFT_AUTH_LOGOUT}/${databaseId}`)
        dispatch(resetMicrosoftAuthSession({ databaseId }))
      }

      dispatch(resetDataAzure())

      setStatus((prev) => ({
        ...prev,
        isAuthenticated: false,
        userEmail: null,
        displayName: null
      }))

      history.push(Pages.home)
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isAuthenticated: false,
        userEmail: null,
        displayName: null
      }))
      history.push(Pages.home)
    }
  }

  const retry = async () => {
    await checkAuthenticationStatus()
  }

  return [status, handleSignIn, handleSignOut, retry]
}
