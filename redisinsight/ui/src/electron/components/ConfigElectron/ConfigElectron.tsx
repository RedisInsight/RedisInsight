import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appAnalyticsInfoSelector,
  appServerInfoSelector,
  appElectronInfoSelector
} from 'uiSrc/slices/app/info'
import { ipcCheckUpdates, ipcSendEvents } from 'uiSrc/electron/utils'
import { ipcDeleteDownloadedVersion } from 'uiSrc/electron/utils/ipcDeleteStoreValues'
import { CloudAuthResponse, CloudAuthStatus } from 'uiSrc/electron/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { fetchAccountInfo, oauthCloudCurrentAccountSelector, signInFailure, signInSuccess } from 'uiSrc/slices/oauth/cloud'

const ConfigElectron = () => {
  let isCheckedUpdates = false
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const serverInfo = useSelector(appServerInfoSelector)
  const currentAccount = useSelector(oauthCloudCurrentAccountSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    window.app.cloudOauthCallback((_e: any, { status, message, error }: CloudAuthResponse) => {
      if (status === CloudAuthStatus.Succeed) {
        dispatch(signInSuccess())
        dispatch(fetchAccountInfo())
      }

      if (status === CloudAuthStatus.Failed) {
        dispatch(signInFailure(error))
        dispatch(addErrorNotification(error))
      }
    })
  }, [])

  useEffect(() => {
    if (serverInfo) {
      ipcCheckUpdates(serverInfo, dispatch)
    }
  }, [serverInfo])

  useEffect(() => {
    if (!isCheckedUpdates && serverInfo && analyticsIdentified) {
      ipcSendEvents(serverInfo)
      isCheckedUpdates = true
    }
  }, [serverInfo, analyticsIdentified])

  useEffect(() => {
    if (isReleaseNotesViewed) {
      ipcDeleteDownloadedVersion()
    }
  }, [isReleaseNotesViewed])

  useEffect(() => {
    console.log({ currentAccount })
  }, [currentAccount])

  return null
}

export default ConfigElectron
