import React, { useContext, useEffect, useRef } from 'react'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor'
import { useSelector } from 'react-redux'
import { merge } from 'lodash'
import { defaultMonacoOptions, MonacoLanguage, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { bufferToString, formatLongName, getCommandMarkdown, Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import {
  buildSuggestion,
  findCurrentArgument,
  generateDetail,
  getRange,
  splitQueryByArgs
} from 'uiSrc/pages/search/components/query/utils'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/components/query/types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface Props {
  value: string
  onChange: (val: string) => void
  indexes: RedisResponseBuffer[]
}

const options = merge(defaultMonacoOptions,
  {
    suggest: {
      showWords: false,
      showIcons: true
    }
  })

const SUPPORTED_COMMANDS_LIST = ['FT.SEARCH', 'FT.AGGREGATE']

const Query = (props: Props) => {
  const { value, onChange, indexes } = props
  const { spec: REDIS_COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)

  const SUPPORTED_COMMANDS = SUPPORTED_COMMANDS_LIST.map((name) => ({
    ...REDIS_COMMANDS_SPEC[name],
    name
  })) as unknown as SearchCommand[]

  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const disposeCompletionItemProvider = useRef(() => {})
  const disposeSignatureHelpProvider = useRef(() => {})
  const suggestionsRef = useRef<monacoEditor.languages.CompletionItem[]>([])
  const helpWidgetRef = useRef<any>({
    isOpen: false,
    parent: null,
    currentArg: null
  })
  const indexesRef = useRef<RedisResponseBuffer[]>([])

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    monaco.languages.register({ id: MonacoLanguage.RediSearch })

    return () => {
      disposeCompletionItemProvider.current?.()
      disposeSignatureHelpProvider.current?.()
    }
  }, [])

  useEffect(() => {
    indexesRef.current = indexes
  }, [indexes])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monacoObjects.current = { editor, monaco }

    suggestionsRef.current = getSuggestions(editor)
    triggerSuggestions()

    disposeSignatureHelpProvider.current?.()
    disposeSignatureHelpProvider.current = monaco.languages.registerSignatureHelpProvider(
      'RediSearch',
      {
        provideSignatureHelp: (): any => {
          if (!helpWidgetRef.current?.isOpen) return null

          const { currentArg, parent } = helpWidgetRef.current
          const label = generateDetail(parent)
          const arg = currentArg?.type === TokenType.Block ? currentArg.arguments[0]?.name : (currentArg?.name || currentArg?.type || '')

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
      }
    ).dispose

    disposeCompletionItemProvider.current?.()
    disposeCompletionItemProvider.current = monaco.languages.registerCompletionItemProvider(
      'RediSearch',
      {
        provideCompletionItems: (): monacoEditor.languages.CompletionList => ({ suggestions: suggestionsRef.current })
      }
    ).dispose

    editor.onDidChangeCursorPosition(() => {
      suggestionsRef.current = []

      if (!editor.getSelection()?.isEmpty()) {
        setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
        return
      }

      suggestionsRef.current = getSuggestions(editor)

      if (suggestionsRef.current?.length) {
        triggerSuggestions()
        helpWidgetRef.current.isOpen = false
        return
      }

      setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
      editor?.trigger('', 'editor.action.triggerParameterHints', '')
    })
  }

  const getIndexesSuggestions = (range: monaco.IRange) => indexesRef.current.map((index) => {
    const value = formatLongName(bufferToString(index))

    return {
      label: value,
      kind: monacoEditor.languages.CompletionItemKind.Snippet,
      insertText: `"${value}" "$1" `,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    }
  })

  const getFieldsSuggestions = (range: monaco.IRange, spaceAfter = false) => ['field1', 'field2'].map((field) => ({
    label: field,
    kind: monacoEditor.languages.CompletionItemKind.Reference,
    insertText: `${field}${spaceAfter ? ' ' : ''}`,
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  }))

  const triggerSuggestions = () => {
    const { monaco, editor } = monacoObjects.current || {}
    if (!monaco) return

    setTimeout(() => editor?.trigger('', 'editor.action.triggerSuggest', { auto: false }))
  }

  const getSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor
  ): monacoEditor.languages.CompletionItem[] => {
    const position = editor.getPosition()
    const model = editor.getModel()

    if (!position || !model) return []

    const value = editor.getValue()
    const offset = model.getOffsetAt(position)
    const word = model.getWordUntilPosition(position)
    const range = getRange(position, word)

    const { args, isCursorInArg, prevCursorChar, nextCursorChar } = splitQueryByArgs(value, offset)
    const [beforeOffsetArgs] = args
    const [firstArg, ...prevArgs] = beforeOffsetArgs

    const commandName = firstArg?.toUpperCase()
    const command = REDIS_COMMANDS_SPEC[commandName] as unknown as SearchCommand

    if (!command && position.lineNumber === 1 && word.startColumn === 1) {
      return SUPPORTED_COMMANDS.map((command) => buildSuggestion(
        command,
        range,
        {
          detail: generateDetail(command),
          documentation: {
            value: getCommandMarkdown(command as any)
          },
        }
      ))
    }

    if (!command) return []

    // cover query
    if (command?.arguments?.[prevArgs.length]?.name === 'query') {
      if (prevCursorChar === '@') {
        return getFieldsSuggestions(range)
      }

      return []
    }

    if (isCursorInArg || nextCursorChar?.trim()) return []

    // just suggest indexes - in future get from BE
    if (prevArgs.length === 0 && command?.arguments?.[0]?.name === 'index') {
      return getIndexesSuggestions(range)
    }

    if (prevArgs.length < 2) return []
    const foundArg = findCurrentArgument(command?.arguments || [], prevArgs)

    console.log('foundArg', foundArg)
    helpWidgetRef.current = {
      isOpen: !!foundArg?.stopArg,
      parent: foundArg?.parent,
      currentArg: foundArg?.stopArg
    }

    // here we suggest arguments of argument
    if (foundArg && !foundArg.isComplete) {
      if (foundArg.stopArg?.name === 'field') {
        return getFieldsSuggestions(range, true)
      }

      if (foundArg.isBlocked) return []
      if (foundArg.append?.length) {
        return foundArg.append.map((arg: any) => buildSuggestion(
          arg,
          range,
          {
            kind: monacoEditor.languages.CompletionItemKind.Property,
            detail: generateDetail(foundArg?.parent)
          }
        ))
      }

      return []
    }

    // the main list of arguments + optional from argument
    // TODO: remove arguments which already used if they are not multiple
    if (!foundArg || foundArg.isComplete) {
      // here we can add append arguments
      const appendCommands = foundArg?.append ?? []

      return [
        ...appendCommands.map((arg: any) => buildSuggestion(
          arg,
          range,
          {
            sortText: 'a',
            kind: monacoEditor.languages.CompletionItemKind.Property,
            detail: generateDetail(foundArg?.parent)
          }
        )),
        ...(command.arguments || [])
          .filter((arg) => arg.optional)
          .filter((arg) => arg.multiple || !args.flat().includes(arg.token || arg.arguments?.[0]?.token || ''))
          .map((arg: any) => buildSuggestion(
            arg,
            range,
            {
              sortText: 'b',
              kind: monacoEditor.languages.CompletionItemKind.Reference,
              detail: generateDetail(arg)
            }
          ))
      ]
    }

    return []
  }

  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language={MonacoLanguage.RediSearch}
      theme={theme === Theme.Dark ? 'dark' : 'light'}
      options={options}
      editorDidMount={editorDidMount}
    />
  )
}

export default Query
