import { isEmpty } from 'lodash'

const COMMENT_SYMBOLS = '//'
const BLANK_LINE_REGEX = /^\s*\n/gm
const QUOTES = ['\'', '"', '`']
const COMMENT_LINE_REGEX = /^\s+\/\/.*/

const removeCommentsFromLine = (text: string = '', prefix: string = ''): string => {
  const [command, ...rest] = text.split(COMMENT_SYMBOLS)
  const isOddQuotes = QUOTES.some((quote: string) =>
    ((prefix + command).split(quote).length - 1) % 2 !== 0)

  if (isOddQuotes && command && rest.length) {
    return removeCommentsFromLine(rest.join(COMMENT_SYMBOLS), prefix + command + COMMENT_SYMBOLS)
  }

  return prefix + text.replace(/\/\/.*/, '')
}

export const removeMonacoComments = (text: string = '') => text
  .split('\n')
  .filter((line: string) => !COMMENT_LINE_REGEX.test(line))
  .map((line: string) => removeCommentsFromLine(line))
  .join('\n')
  .trim()

export const multilineCommandToOneLine = (text: string = '') => text
  .split(/(\r\n|\n|\r)+\s+/gm)
  .filter((line: string) => !(BLANK_LINE_REGEX.test(line) || isEmpty(line)))
  .join(' ')
