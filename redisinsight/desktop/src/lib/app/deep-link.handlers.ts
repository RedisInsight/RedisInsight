import log from 'electron-log'
import { parse } from 'url'
import {
  cloudDeepLinkHandler
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

export const deepLinkHandler = async (from?: string) => {
  if (!from) return
  try {
    const url = parse(from, true)

    switch (url?.hostname) {
      case 'cloud':
        await cloudDeepLinkHandler(url)
        break
      default:
        log.warn('Unknown deep link hostname', url?.hostname)
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
