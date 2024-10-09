import { monaco as monacoEditor } from 'react-monaco-editor'
import { remove } from 'lodash'
import { SearchCommand } from 'uiSrc/pages/workbench/types'

const STRING_DOUBLE = 'string.double'

export const getRedisMonarchTokensProvider = (commands: SearchCommand[]): monacoEditor.languages.IMonarchLanguage => {
  const commandRedisCommands = [...commands]
  const searchCommands = remove(commandRedisCommands, ({ token }) => token?.startsWith('FT.'))
  const COMMON_COMMANDS_REGEX = `(${commandRedisCommands.map(({ token }) => token).join('|')})\\b`
  const SEARCH_COMMANDS_REGEX = `(${searchCommands.map(({ token }) => token).join('|')})\\b`

  return {
    defaultToken: '',
    tokenPostfix: '.redis',
    ignoreCase: true,
    brackets: [
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],
    keywords: commands.map(({ token }) => token),
    operators: [],
    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@numbers' },
        { include: '@strings' },
        { include: '@keyword' },
        [/[;,.]/, 'delimiter'],
        [/[()]/, '@brackets'],
        [
          /[\w@#$]+/,
          {
            cases: {
              '@keywords': 'keyword',
              '@operators': 'operator',
              '@default': 'identifier',
            },
          },
        ],
        [/[<>=!%&+\-*/|~^]/, 'operator'],
      ],
      keyword: [
        [COMMON_COMMANDS_REGEX, { token: 'keyword' }],
        [SEARCH_COMMANDS_REGEX, { token: '@rematch', nextEmbedded: 'redisearch', next: '@endRedisearch' }],
      ],
      whitespace: [
        [/\s+/, 'white'],
        [/\/\/.*$/, 'comment'],
      ],
      numbers: [
        [/0[xX][0-9a-fA-F]*/, 'number'],
        [/[$][+-]*\d*(\.\d*)?/, 'number'],
        [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
      ],
      strings: [
        [/'/, { token: 'string', next: '@string' }],
        [/"/, { token: STRING_DOUBLE, next: '@stringDouble' }],
      ],
      string: [
        [/\\./, 'string'],
        [/'/, { token: 'string', next: '@pop' }],
        [/[^\\']+/, 'string'],
      ],
      stringDouble: [
        [/\\./, STRING_DOUBLE],
        [/"/, { token: STRING_DOUBLE, next: '@pop' }],
        [/[^\\"]+/, STRING_DOUBLE],
      ],
      // TODO: can be tokens or functions the same - need to think how to avoid wrong ending
      endRedisearch: [
        [`^\\s*${COMMON_COMMANDS_REGEX}`, { token: '@rematch', next: '@root', nextEmbedded: '@pop', log: 'end' }],
      ]
    },
  }
}
