import { monaco as monacoEditor } from 'react-monaco-editor'
import { SearchCommand } from 'uiSrc/pages/search/types'
import {
  generateKeywords,
  generateTokens,
  generateTokensWithFunctions,
  getBlockTokens, isIndexAfterKeyword,
  isQueryAfterIndex
} from 'uiSrc/utils/monaco/redisearch/utils_old'
import { generateQuery } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensTemplates'

const STRING_DOUBLE = 'string.double'

export const getRediSearchMonarchTokensProvider = (
  commands: SearchCommand[],
  command?: string
): monacoEditor.languages.IMonarchLanguage => {
  const currentCommand = commands.find(({ name }) => name === command)

  const keywords = generateKeywords(commands)
  const isHighlightIndex = isIndexAfterKeyword(currentCommand)
  const argTokens = generateTokens(currentCommand)
  const isHighlightQuery = isQueryAfterIndex(currentCommand)

  return (
    {
      defaultToken: '',
      tokenPostfix: '.redisearch',
      ignoreCase: true,
      brackets: [
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
      ],
      keywords,
      tokenizer: {
        root: [
          { include: '@fields' },
          { include: '@whitespace' },
          { include: '@numbers' },
          { include: '@strings' },
          { include: '@keyword' },
          [/LOAD\s+\*/, 'loadAll'],
          { include: '@argument.block' },
          { include: '@argument.block.withFunctions' },
          [/[;,.]/, 'delimiter'],
          [/[()]/, '@brackets'],
          [
            /[\w@#$]+/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            },
          ],
          [/[<>=!%&+\-*/|~^]/, 'operator'],
        ],
        keyword: [
          [`(${keywords.join('|')})\\b`, { token: 'keyword', next: isHighlightIndex ? '@index' : '@root' }]
        ],
        'argument.block': getBlockTokens(argTokens?.pureTokens),
        ...generateTokensWithFunctions(argTokens?.tokensWithQueryAfter),
        index: [
          [/"([^"\\]|\\.)*"/, { token: 'index', next: isHighlightQuery ? '@query' : '@root' }],
          [/'([^'\\]|\\.)*'/, { token: 'index', next: isHighlightQuery ? '@query' : '@root' }],
          [/[\w:]+/, { token: 'index', next: isHighlightQuery ? '@query' : '@root' }],
          { include: 'root' } // Fallback to the root state if nothing matches
        ],
        ...generateQuery(),
        fields: [
          [/@\w+/, { token: 'field', }]
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
      },
    }
  )
}
