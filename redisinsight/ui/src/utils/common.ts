import { ENV_VARS } from 'uiSrc/utils'

const baseApiUrl = ENV_VARS.BASE_API_URL
const isDevelopment = ENV_VARS.NODE_ENV === 'development'
const isWebApp = ENV_VARS.APP_ENV === 'web'
const apiPort = ENV_VARS.API_PORT

export const getBaseApiUrl = () => (!isDevelopment && isWebApp
  ? window.location.origin
  : `${baseApiUrl}:${apiPort}`)

export const getNodeText = (node: number | string | JSX.Element): string => {
  if (['string', 'number'].includes(typeof node)) return node?.toString()
  if (node instanceof Array) return node.map(getNodeText).join('')
  if (typeof node === 'object' && node) return getNodeText(node.props.children)
}

export const removeSymbolsFromStart = (str = '', symbol = ''): string => {
  if (str.startsWith(symbol)) {
    return str.slice(symbol.length)
  }
  return str
}
