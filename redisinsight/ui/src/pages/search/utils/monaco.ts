import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor'
import { isString } from 'lodash'
import { generateDetail } from 'uiSrc/pages/search/utils/query'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { bufferToString, formatLongName, Maybe } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export const getRange = (position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.IRange => ({
  startLineNumber: position.lineNumber,
  endLineNumber: position.lineNumber,
  endColumn: word.endColumn,
  startColumn: word.startColumn,
})

export const buildSuggestion = (arg: SearchCommand, range: monaco.IRange, options: any = {}) => ({
  label: isString(arg) ? arg : arg.token || arg.arguments?.[0].token || arg.name || '',
  insertText: `${arg.token || arg.arguments?.[0].token || arg.name?.toUpperCase() || ''} `,
  insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  range,
  kind: options?.kind || monacoEditor.languages.CompletionItemKind.Function,
  ...options,
})

export const getIndexesSuggestions = (indexes: RedisResponseBuffer[], range: monaco.IRange) =>
  indexes.map((index) => {
    const value = formatLongName(bufferToString(index))

    return {
      label: value || ' ',
      kind: monacoEditor.languages.CompletionItemKind.Snippet,
      insertText: `"${value}" "$1" `,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    }
  })

export const getFieldsSuggestions = (fields: string[], range: monaco.IRange, spaceAfter = false) =>
  fields.map((field) => ({
    label: field,
    kind: monacoEditor.languages.CompletionItemKind.Reference,
    insertText: `${field}${spaceAfter ? ' ' : ''}`,
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  }))

export const getRediSearchSignutureProvider = (options: Maybe<{
  isOpen: boolean
  currentArg: SearchCommand
  parent: Maybe<SearchCommand>
}>) => {
  const { isOpen, currentArg, parent } = options || {}

  if (!isOpen) return null

  const label = generateDetail(parent)
  const arg = currentArg?.type === TokenType.Block
    ? currentArg?.arguments?.[0]?.name
    : (currentArg?.name || currentArg?.type || '')

  return {
    dispose: () => {},
    value: {
      activeParameter: 0,
      activeSignature: 0,
      signatures: [{
        label: label || '',
        parameters: [{ label: arg }]
      }]
    }
  }
}
