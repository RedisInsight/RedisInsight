import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appAnalyticsInfoSelector,
  appServerInfoSelector,
  appElectronInfoSelector
} from 'uiSrc/slices/app/info'
import { ipcCheckUpdates, ipcSendEvents } from 'uiSrc/electron/utils'
import { ipcDeleteDownloadedVersion } from 'uiSrc/electron/utils/ipcDeleteStoreValues'

const ConfigElectron = () => {
  let isCheckedUpdates = false
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const serverInfo = useSelector(appServerInfoSelector)

  const dispatch = useDispatch()

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

  return null
}

export default ConfigElectron
