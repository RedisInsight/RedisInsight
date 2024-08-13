import { monaco as monacoEditor } from 'react-monaco-editor'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'

const STRING_DOUBLE = 'string.double'

const generateKeywords = (commands: SearchCommand[]) => commands.map(({ name }) => name)
const generateTokens = (command?: SearchCommand) => {
  if (!command) return []
  const levels: Array<Array<string>> = []

  function processArguments(args: SearchCommand[], level = 0) {
    // Ensure the current level exists in the levels array
    if (!levels[level]) {
      levels[level] = []
    }

    args.forEach((arg) => {
      if (arg.token) levels[level].push(arg.token)

      if (arg.type === TokenType.Block && arg.arguments) {
        const blockToken = arg.arguments[0].token
        const nextArgs = arg.arguments
        if (blockToken) {
          levels[level].push(blockToken)
        }
        processArguments(blockToken ? nextArgs.slice(1, nextArgs.length) : nextArgs, level + 1)
      }

      if (arg.type === TokenType.OneOf && arg.arguments) {
        arg.arguments.forEach((choice) => {
          if (choice.token) levels[level].push(choice.token)
        })
      }
    })
  }

  if (command.arguments) {
    processArguments(command.arguments, 0)
  }

  return levels
}

export const getRediSearchMonarchTokensProvider = (
  commands: SearchCommand[],
  command?: string
): monacoEditor.languages.IMonarchLanguage => {
  const currentCommand = commands.find(({ name }) => name === command)

  const keywords = generateKeywords(commands)
  const argTokens = generateTokens(currentCommand)

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
          { include: '@whitespace' },
          { include: '@numbers' },
          { include: '@strings' },
          { include: '@keyword' },
          [/LOAD\s+\*/, 'loadAll'],
          { include: '@argument.block' },
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
          [`(${keywords.join('|')})\\b`, { token: 'keyword', next: '@index' }]
        ],
        'argument.block': argTokens.map((tokens, lvl) => [`(${tokens.join('|')})\\b`, `argument.block.${lvl}`]),
        index: [
          [/"([^"\\]|\\.)*"/, { token: 'index', next: '@query' }],
          [/'([^'\\]|\\.)*'/, { token: 'index', next: '@query' }],
          [/[a-zA-Z_]\w*/, { token: 'index', next: '@query' }],
          { include: 'root' } // Fallback to the root state if nothing matches
        ],
        query: [
          [/"/, { token: 'query', next: '@queryInsideDouble' }],
          [/'/, { token: 'query', next: '@queryInsideSingle' }],
          [/[a-zA-Z_]\w*/, { token: 'query', next: '@root' }],
          { include: 'root' } // Fallback to the root state if nothing matches
        ],
        queryInsideDouble: [
          [/@/, { token: 'field', next: '@fieldInDouble' }],
          [/\\"/, { token: 'query', next: 'queryInsideDouble' }],
          [/"/, { token: 'query', next: '@root' }],
          [/./, { token: 'query', next: '@queryInsideDouble' }],
          { include: '@query' } // Fallback to the root state if nothing matches
        ],
        queryInsideSingle: [
          [/@/, { token: 'field', next: '@fieldInSingle' }],
          [/\\'/, { token: 'query', next: 'queryInsideSingle' }],
          [/'/, { token: 'query', next: '@root' }],
          [/./, { token: 'query', next: '@queryInsideSingle' }],
          { include: '@query' } // Fallback to the root state if nothing matches
        ],
        fieldInDouble: [
          [/\w+/, { token: 'field', next: '@queryInsideDouble' }],
          [/\s+/, { token: '@rematch', next: '@queryInsideDouble' }],
          [/"/, { token: 'query', next: '@root' }],
          { include: '@query' } // Fallback to the root state if nothing matches
        ],
        fieldInSingle: [
          [/\w+/, { token: 'field', next: '@queryInsideSingle' }],
          [/\s+/, { token: '@rematch', next: '@queryInsideSingle' }],
          [/'/, { token: 'query', next: '@root' }],
          { include: '@query' } // Fallback to the root state if nothing matches
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
