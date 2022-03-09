import getUrl from './getUrlInstance'
import removeEmpty from './removeEmpty'
import { Nullable, Maybe } from './types'
import handlePasteHostName from './handlePasteHostName'
import RouterWithSubRoutes from './routerWithSubRoutes'
import replaceSpaces from './replaceSpaces'
import setFavicon from './setFavicon'
import setTitle from './setPageTitle'
import formatToText from './cliTextFormatter'

export * from './common'
export * from './validations'
export * from './errors'
export * from './statuses'
export * from './instanceOptions'
export * from './truncateTTL'
export * from './truncateNumber'
export * from './apiResponse'
export * from './parseResponse'
export * from './compareVersions'
export * from './compareConsents'
export * from './longNames'
export * from './cliHelper'
export * from './commands'
export * from './workbench'
export * from './formatBytes'
export * from './instanceModules'
export * from './monacoUtils'
export * from './monacoInterfaces'
export * from './monacoRedisCompletionProvider'
export * from './monacoRedisMonarchTokensProvider'
export * from './monacoRedisSignatureHelpProvider'
export * from './monacoActions'
export * from './monacoDecorations'
export * from './monitorUtils'
export * from './handlePlatforms'
export * from './plugins'
export * from './redistack'

export {
  Maybe,
  Nullable,
  getUrl,
  removeEmpty,
  replaceSpaces,
  handlePasteHostName,
  RouterWithSubRoutes,
  setFavicon,
  setTitle,
  formatToText,
}
