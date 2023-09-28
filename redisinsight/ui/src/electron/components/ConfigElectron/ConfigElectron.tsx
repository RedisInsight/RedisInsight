import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'
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
  const history = useHistory()

  useEffect(() => {
    window.app?.deepLinkAction?.(deepLinkAction)
  }, [])

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

  const deepLinkAction = (_e: any, url: IParsedDeepLink) => {
    if (url.from) {
      history.push({
        search: `from=${url.from}`
      })
    }
  }

  return null
}

export default ConfigElectron
