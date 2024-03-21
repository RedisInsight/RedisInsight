import { monaco as monacoEditor } from 'react-monaco-editor'
import { getCypherCompletionProvider } from 'uiSrc/utils/monaco/cypher/completionProvider'
import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/cypher/monarchTokensProvider'
import { cypherLanguageConfiguration } from './cypher'
import { DSL, DSLNaming } from '../commands'

export interface MonacoSyntaxLang {
  [key: string]: {
    name: string
    id: string
    language: string
    config?: monacoEditor.languages.LanguageConfiguration,
    completionProvider?: () => monacoEditor.languages.CompletionItemProvider,
    tokensProvider?: () => monacoEditor.languages.IMonarchLanguage
  }
}

export enum MonacoLanguage {
  Redis = 'redisLanguage',
  Cypher = 'cypherLanguage',
  SQL = 'sql',
  Text = 'text',
}

export const DEFAULT_MONACO_YAML_URI = 'http://example.com/schema-name.json'
export const DEFAULT_MONACO_FILE_MATCH = '*'

export const DEDICATED_EDITOR_LANGUAGES: MonacoSyntaxLang = {
  [DSL.cypher]: {
    name: DSLNaming[DSL.cypher],
    id: MonacoLanguage.Cypher,
    language: MonacoLanguage.Cypher,
    config: cypherLanguageConfiguration,
    completionProvider: getCypherCompletionProvider,
    tokensProvider: getCypherMonarchTokensProvider,
  },
  [DSL.sql]: {
    name: DSLNaming[DSL.sql],
    id: DSL.sql,
    language: MonacoLanguage.SQL,
  },
  [DSL.jmespath]: {
    name: DSLNaming[DSL.jmespath],
    id: DSL.jmespath,
    language: MonacoLanguage.Text,
  },
}

export const MONACO_MANUAL = '// Workbench is the advanced Redis command-line interface that allows to send commands to Redis, read and visualize the replies sent by the server.\n'
  + '// Enter multiple commands at different rows to run them at once.\n'
  + '// Start a new line with an indent (Tab) to specify arguments for any Redis command in multiple line mode.\n'
  + '// Use F1 to see the full list of shortcuts available in Workbench.\n'
  + '// Use Ctrl+Space (Cmd+Space) to see the list of commands and information about commands and their arguments in the suggestion list.\n'
  + '// Use Ctrl+Shift+Space (Cmd+Shift+Space) to see the list of arguments for commands.\n'
