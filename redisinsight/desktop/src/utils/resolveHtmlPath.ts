/* eslint import/prefer-default-export: off */
import { URL, URLSearchParams } from 'url'
import path from 'path'
import { configMain as config } from 'desktopSrc/config'
import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'

export const resolveHtmlPath = (htmlFileName: string, parsedDeepLink?: IParsedDeepLink) => {
  if (config.isDevelopment && false) {
    const port = process.env.PORT || 1212
    const url = new URL(`http://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }

  let resolved = `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}#/`

  if (parsedDeepLink) {
    try {
      if (parsedDeepLink.initialPage) {
        const initialPage = parsedDeepLink.initialPage.slice(+parsedDeepLink.initialPage.startsWith('/'))
        resolved += initialPage
      }

      const queryParameters = new URLSearchParams([
        ['from', parsedDeepLink.from || ''],
        ['target', parsedDeepLink.target || ''],
      ])

      resolved += `${resolved.indexOf('?') !== -1 ? '&' : '?'}${queryParameters.toString()}`
    } catch (e) {
      // todo: log error
    }
  }

  return resolved
}
