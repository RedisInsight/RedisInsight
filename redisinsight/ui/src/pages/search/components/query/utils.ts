import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName, getCommandMarkdown, Nullable } from 'uiSrc/utils'
import { buildSuggestion, generateDetail } from 'uiSrc/pages/search/utils'
import { FoundCommandArgument, SearchCommand } from 'uiSrc/pages/search/types'
import { DefinedArgumentName } from 'uiSrc/pages/search/components/query/constants'

export const asSuggestionsRef = (suggestions: monacoEditor.languages.CompletionItem[], forceHide = true) => ({
  data: suggestions,
  forceHide
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

export const getFieldsSuggestions = (fields: any[], range: monaco.IRange, spaceAfter = false) =>
  fields.map(({ attribute }) => ({
    label: attribute,
    kind: monacoEditor.languages.CompletionItemKind.Reference,
    insertText: `${attribute}${spaceAfter ? ' ' : ''}`,
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  }))

export const getCommandsSuggestions = (commands: SearchCommand[], range: monaco.IRange) => asSuggestionsRef(
  commands.map((command) => buildSuggestion(command, range, {
    detail: generateDetail(command),
    documentation: {
      value: getCommandMarkdown(command as any)
    },
  }))
)

export const getMandatoryArgumentSuggestions = (
  foundArg: FoundCommandArgument,
  fields: any[],
  range: monaco.IRange
) => {
  if (foundArg.stopArg?.name === DefinedArgumentName.field) {
    return asSuggestionsRef(getFieldsSuggestions(fields, range, true))
  }

  if (foundArg.isBlocked) return asSuggestionsRef([])
  if (foundArg.append?.length) {
    return asSuggestionsRef(foundArg.append.map((arg: any) => buildSuggestion(arg, range, {
      kind: monacoEditor.languages.CompletionItemKind.Property,
      detail: generateDetail(foundArg?.parent)
    })))
  }

  return asSuggestionsRef([])
}

export const getOptionalSuggestions = (
  command: SearchCommand,
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  range: monaco.IRange
) => {
  const appendCommands = foundArg?.append ?? []

  return asSuggestionsRef([
    ...appendCommands.map((arg) => buildSuggestion(arg, range, {
      sortText: 'a',
      kind: monacoEditor.languages.CompletionItemKind.Property,
      detail: generateDetail(foundArg?.parent)
    })),
    ...(command?.arguments || [])
      .filter((arg) => arg.optional)
      .filter((arg) => arg.multiple || !allArgs.includes(arg.token || arg.arguments?.[0]?.token || ''))
      .map((arg) => buildSuggestion(arg, range, {
        sortText: 'b',
        kind: monacoEditor.languages.CompletionItemKind.Reference,
        detail: generateDetail(arg)
      }))
  ])
}
