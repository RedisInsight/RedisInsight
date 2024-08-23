import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName, getCommandMarkdown, Nullable } from 'uiSrc/utils'
import { addOwnTokenToArgs, buildSuggestion, findCurrentArgument, generateDetail } from 'uiSrc/pages/search/utils'
import { CommandContext, CursorContext, FoundCommandArgument, SearchCommand } from 'uiSrc/pages/search/types'
import { DefinedArgumentName } from 'uiSrc/pages/search/components/query/constants'

export const asSuggestionsRef = (suggestions: monacoEditor.languages.CompletionItem[], forceHide = true) => ({
  data: suggestions,
  forceHide
})

export const getIndexesSuggestions = (indexes: RedisResponseBuffer[], range: monaco.IRange, nextQoutes = true) =>
  indexes.map((index) => {
    const value = formatLongName(bufferToString(index))
    const insertQueryQuotes = nextQoutes ? ' "$1"' : ''

    return {
      label: value || ' ',
      kind: monacoEditor.languages.CompletionItemKind.Snippet,
      insertText: `"${value}"${insertQueryQuotes} `,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      detail: value || ' ',
    }
  })

export const getFieldsSuggestions = (fields: any[], range: monaco.IRange, spaceAfter = false) =>
  fields.map(({ attribute }) => {
    const insertText = attribute.trim() ? attribute : `"${attribute}"`
    return {
      label: attribute || ' ',
      kind: monacoEditor.languages.CompletionItemKind.Reference,
      insertText: `${insertText}${spaceAfter ? ' ' : ''}`,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      detail: attribute || ' ',
    }
  })

export const getCommandsSuggestions = (commands: SearchCommand[], range: monaco.IRange) => asSuggestionsRef(
  commands.map((command) => buildSuggestion(command, range, {
    detail: generateDetail(command),
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: {
      value: getCommandMarkdown(command as any)
    },
  })), false
)

export const getMandatoryArgumentSuggestions = (
  foundArg: FoundCommandArgument,
  fields: any[],
  range: monaco.IRange
): monacoEditor.languages.CompletionItem[] => {
  if (foundArg.stopArg?.name === DefinedArgumentName.field) {
    if (!fields.length) return []
    return getFieldsSuggestions(fields, range, true)
  }

  if (foundArg.isBlocked) return []
  if (foundArg.append?.length) {
    return foundArg.append.map((arg: any) => buildSuggestion(arg, range, {
      kind: monacoEditor.languages.CompletionItemKind.Property,
      detail: generateDetail(foundArg?.parent)
    }))
  }

  return []
}

export const getCommandSuggestions = (
  firstLevelArgs: SearchCommand[],
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  range: monaco.IRange,
  currentArg?: string
) => {
  const appendCommands = foundArg?.append ?? []

  return [
    ...appendCommands.map((arg) => buildSuggestion(arg, range, {
      sortText: 'a',
      kind: monacoEditor.languages.CompletionItemKind.Property,
      detail: generateDetail(foundArg?.parent)
    })),
    ...firstLevelArgs
      .filter((arg) =>
        arg.multiple || !(currentArg !== arg.token && allArgs.includes(arg.token || arg.arguments?.[0]?.token || '')))
      .map((arg) => buildSuggestion(arg, range, {
        sortText: 'b',
        kind: monacoEditor.languages.CompletionItemKind.Reference,
        detail: generateDetail(arg)
      }))
  ]
}

export const getGeneralSuggestions = (
  commandContext: CommandContext,
  cursorContext: CursorContext,
  fields: any[],
): {
  suggestions: monacoEditor.languages.CompletionItem[],
  forceHide?: boolean
  helpWidgetData?: any
} => {
  const { command, prevArgs } = commandContext
  const { range } = cursorContext
  const foundArg = findCurrentArgument(command?.arguments || [], prevArgs)

  if (foundArg && !foundArg.isComplete) {
    return {
      suggestions: getMandatoryArgumentSuggestions(foundArg, fields, range),
      helpWidgetData: {
        isOpen: !!foundArg?.stopArg,
        parent: foundArg?.parent,
        currentArg: foundArg?.stopArg
      }
    }
  }

  return getNextSuggestions(commandContext, cursorContext, foundArg)
}

export const getNextSuggestions = (
  { command, currentCommandArg, prevArgs, allArgs }: CommandContext,
  { currentOffsetArg, range }: CursorContext,
  foundArg: Nullable<FoundCommandArgument>
) => {
  if (!command) return { suggestions: [] }
  if (foundArg && !foundArg.isComplete) return { suggestions: [], helpWidgetData: { isOpen: false } }

  const parentArgIndex = command.arguments
    ?.findIndex(({ name }) => name === foundArg?.parent?.name) || -1
  const currentArgIndex = parentArgIndex > -1 ? parentArgIndex : prevArgs.length - 1
  const nextMandatoryIndex = command.arguments
    ?.findIndex(({ optional }, i) => !optional && i > currentArgIndex) || -1

  const nextOptionalArgs = (
    nextMandatoryIndex > -1
      ? command.arguments?.slice(currentArgIndex + 1, nextMandatoryIndex)
      : command.arguments?.filter(({ optional }) => optional)
  ) || []
  const nextMandatoryArg = command.arguments?.[nextMandatoryIndex]

  if (nextMandatoryArg?.token) {
    nextOptionalArgs.unshift(nextMandatoryArg)
  }

  if (nextMandatoryArg && !nextMandatoryArg.token) {
    return {
      helpWidgetData: {
        isOpen: !!currentCommandArg,
        parent: addOwnTokenToArgs(command.name!, command),
        currentArg: nextMandatoryArg
      },
      suggestions: []
    }
  }

  return {
    suggestions: getCommandSuggestions(nextOptionalArgs, foundArg, allArgs, range, currentOffsetArg),
    helpWidgetData: { isOpen: false }
  }
}

export const isIndexComplete = (index: string) => {
  if (index.length === 0) return false

  const firstChar = index[0]
  const lastChar = index[index.length - 1]

  if (firstChar !== '"' && firstChar !== "'") return true
  if (index.length === 1 && (firstChar === '"' || firstChar === "'")) return false
  if (firstChar !== lastChar) return false

  let escape = false
  for (let i = 1; i < index.length - 1; i++) {
    escape = index[i] === '\\' && !escape
  }

  return !escape
}
