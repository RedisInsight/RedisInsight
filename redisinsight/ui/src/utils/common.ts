const baseApiUrl = process.env.BASE_API_URL
const isDevelopment = process.env.NODE_ENV === 'development'
const isWebApp = process.env.APP_ENV === 'web'
const { apiPort } = window.app.config

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
