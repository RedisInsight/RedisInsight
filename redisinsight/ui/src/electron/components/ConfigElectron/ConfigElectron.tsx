import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appServerInfoSelector,
  appElectronInfoSelector
} from 'uiSrc/slices/app/info'
import { ipcCheckUpdates, ipcSendEvents } from 'uiSrc/electron/utils'
import { ipcDeleteDownloadedVersion } from 'uiSrc/electron/utils/ipcDeleteStoreValues'

const ConfigElectron = () => {
  let isCheckedUpdates = false
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const serverInfo = useSelector(appServerInfoSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (serverInfo) {
      ipcCheckUpdates(serverInfo, dispatch)
    }
  }, [serverInfo])

  useEffect(() => {
    if (!isCheckedUpdates && serverInfo) {
      ipcSendEvents(serverInfo)
      isCheckedUpdates = true
    }
  }, [serverInfo])

  useEffect(() => {
    if (isReleaseNotesViewed) {
      ipcDeleteDownloadedVersion()
    }
  }, [isReleaseNotesViewed])

  return null
}

export default ConfigElectron
