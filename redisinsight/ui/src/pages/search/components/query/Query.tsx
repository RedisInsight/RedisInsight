import React, { useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { useDispatch } from 'react-redux'

import { ICommands, MonacoLanguage, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import {
  addOwnTokenToArgs,
  findCurrentArgument,
  getRange,
  getRediSearchSignutureProvider,
  setCursorPositionAtTheEnd,
  splitQueryByArgs
} from 'uiSrc/pages/search/utils'
import { CursorContext, FoundCommandArgument, SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { fetchRedisearchInfoAction } from 'uiSrc/slices/browser/redisearch'
import { getRediSearchMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokens'
import { installRedisearchTheme, RedisearchMonacoTheme } from 'uiSrc/utils/monaco/monacoThemes'
import { useDebouncedEffect } from 'uiSrc/services'
import { options, DefinedArgumentName, FIELD_START_SYMBOL } from './constants'
import {
  getFieldsSuggestions,
  getIndexesSuggestions,
  asSuggestionsRef,
  getCommandsSuggestions,
  isIndexComplete,
  getGeneralSuggestions,
  getFunctionsSuggestions,
} from './utils'

export interface Props {
  value: string
  onChange: (val: string) => void
  indexes: RedisResponseBuffer[]
  supportedCommands?: SearchCommand[]
  commandsSpec?: ICommands
}

const Query = (props: Props) => {
  const { value, onChange, indexes, supportedCommands = [], commandsSpec } = props

  const [selectedCommand, setSelectedCommand] = useState('')
  const [selectedIndex, setSelectedIndex] = useState('')

  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const disposeCompletionItemProvider = useRef(() => {})
  const disposeSignatureHelpProvider = useRef(() => {})
  const suggestionsRef = useRef<{
    forceShow?: boolean
    forceHide: boolean
    data: monacoEditor.languages.CompletionItem[]
  }>({ forceHide: false, data: [] })
  const helpWidgetRef = useRef<any>({
    isOpen: false,
    parent: null,
    currentArg: null
  })
  const indexesRef = useRef<RedisResponseBuffer[]>([])
  const attributesRef = useRef<any>([])
  const isEscapedSuggestions = useRef<boolean>(false)

  const COMMANDS_LIST = supportedCommands.map((command) => ({
    ...addOwnTokenToArgs(command.name!, command),
    token: command.name!,
    type: TokenType.Block
  }))

  const { theme } = useContext(ThemeContext)
  const dispatch = useDispatch()

  useEffect(() => () => {
    disposeCompletionItemProvider.current?.()
    disposeSignatureHelpProvider.current?.()
  }, [])

  useEffect(() => {
    indexesRef.current = indexes
  }, [indexes])

  useEffect(() => {
    monacoEditor.languages.setMonarchTokensProvider(
      MonacoLanguage.RediSearch,
      getRediSearchMonarchTokensProvider(supportedCommands, selectedCommand)
    )
  }, [selectedCommand])

  useDebouncedEffect(() => {
    attributesRef.current = []
    if (!isIndexComplete(selectedIndex)) return

    const index = selectedIndex.replace(/^(['"])(.*)\1$/, '$2')
    dispatch(fetchRedisearchInfoAction(index,
      (data) => {
        const { attributes } = data as any
        attributesRef.current = attributes
      }))
  }, 200, [selectedIndex])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monaco.languages.register({ id: MonacoLanguage.RediSearch })
    monacoObjects.current = { editor, monaco }

    suggestionsRef.current = getSuggestions(editor)

    if (value) {
      setCursorPositionAtTheEnd(editor)
    } else {
      const position = editor.getPosition()

      if (position?.column === 1 && position?.lineNumber === 1) {
        editor.focus()
        triggerSuggestions()
      }
    }

    monaco.languages.setMonarchTokensProvider(
      MonacoLanguage.RediSearch,
      getRediSearchMonarchTokensProvider(supportedCommands)
    )

    disposeSignatureHelpProvider.current?.()
    disposeSignatureHelpProvider.current = monaco.languages.registerSignatureHelpProvider(MonacoLanguage.RediSearch, {
      provideSignatureHelp: (): any => getRediSearchSignutureProvider(helpWidgetRef?.current)
    }).dispose

    disposeCompletionItemProvider.current?.()
    disposeCompletionItemProvider.current = monaco.languages.registerCompletionItemProvider(MonacoLanguage.RediSearch, {
      provideCompletionItems: (): monacoEditor.languages.CompletionList =>
        ({ suggestions: suggestionsRef.current.data })
    }).dispose

    installRedisearchTheme()

    editor.onDidChangeCursorPosition(handleCursorChange)
    editor.onKeyDown((e: monacoEditor.IKeyboardEvent) => {
      if (e.keyCode === monacoEditor.KeyCode.Escape && isSuggestionsOpened()) {
        isEscapedSuggestions.current = true
      }
    })
  }

  const isSuggestionsOpened = () => {
    const { editor } = monacoObjects.current || {}
    if (!editor) return false
    const suggestController = editor.getContribution<any>('editor.contrib.suggestController')
    return suggestController?.model?.state === 1
  }

  const handleCursorChange = () => {
    const { editor } = monacoObjects.current || {}
    suggestionsRef.current.data = []

    if (!editor) return
    if (!editor.getSelection()?.isEmpty()) {
      editor?.trigger('', 'hideSuggestWidget', null)
      return
    }

    suggestionsRef.current = getSuggestions(editor)

    if (!suggestionsRef.current.forceShow) {
      editor.trigger('', 'editor.action.triggerParameterHints', '')
      return
    }

    if (suggestionsRef.current.data.length) {
      helpWidgetRef.current.isOpen = false
      triggerSuggestions()
      return
    }

    editor.trigger('', 'editor.action.triggerParameterHints', '')

    if (suggestionsRef.current.forceHide) {
      setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
    } else {
      helpWidgetRef.current.isOpen = !isSuggestionsOpened() && helpWidgetRef.current.isOpen
    }
  }

  const triggerSuggestions = () => {
    const { monaco, editor } = monacoObjects.current || {}
    if (!monaco) return

    setTimeout(() => editor?.trigger('', 'editor.action.triggerSuggest', { auto: false }))
  }

  const updateHelpWidget = (isOpen: boolean, parent?: SearchCommand, currentArg?: SearchCommand) => {
    helpWidgetRef.current.isOpen = isOpen
    helpWidgetRef.current.parent = parent
    helpWidgetRef.current.currentArg = currentArg
  }

  const getSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor
  ): {
    forceHide: boolean
    data: monacoEditor.languages.CompletionItem[]
  } => {
    const position = editor.getPosition()
    const model = editor.getModel()

    if (!position || !model) return asSuggestionsRef([])

    const value = editor.getValue()
    const offset = model.getOffsetAt(position)
    const word = model.getWordUntilPosition(position)
    const range = getRange(position, word)

    const { args, cursor } = splitQueryByArgs(value, offset)
    const { prevCursorChar } = cursor

    const allArgs = args.flat()
    const [beforeOffsetArgs, [currentOffsetArg]] = args
    const [firstArg, ...prevArgs] = beforeOffsetArgs

    const commandName = (firstArg || currentOffsetArg)?.toUpperCase()
    const command = commandsSpec?.[commandName] as unknown as SearchCommand

    const isCommandSuppurted = supportedCommands.some(({ name }) => commandName === name)
    if (command && !isCommandSuppurted) return asSuggestionsRef([])
    if (!command && position.lineNumber === 1 && position.column === 1) {
      return getCommandsSuggestions(supportedCommands, range)
    }

    if (!command) {
      helpWidgetRef.current.isOpen = false
      return asSuggestionsRef([], false)
    }

    // TODO: change to more generic logic
    setSelectedIndex(allArgs[1] || '')
    setSelectedCommand(commandName)

    const foundArg = findCurrentArgument(COMMANDS_LIST, beforeOffsetArgs)
    if (prevCursorChar === FIELD_START_SYMBOL) {
      helpWidgetRef.current.isOpen = false
      return asSuggestionsRef(
        getFieldsSuggestions(
          attributesRef.current,
          range,
          false,
          foundArg?.stopArg?.name === DefinedArgumentName.query
        ),
        false
      )
    }

    const cursorContext: CursorContext = { ...cursor, currentOffsetArg, offset }
    switch (foundArg?.stopArg?.name) {
      case DefinedArgumentName.index: {
        return handleIndexSuggestions(command, foundArg, prevArgs.length, currentOffsetArg, range)
      }
      case DefinedArgumentName.query: {
        return handleQuerySuggestions(command, foundArg)
      }
      default: {
        return handleCommonSuggestions(value, foundArg, allArgs, cursorContext, range)
      }
    }
  }

  const handleIndexSuggestions = (
    command: SearchCommand,
    foundArg: FoundCommandArgument,
    prevArgsLength: number,
    currentOffsetArg: Nullable<string>,
    range: monacoEditor.IRange
  ) => {
    updateHelpWidget(true, command, foundArg?.stopArg)
    if (currentOffsetArg) return asSuggestionsRef([], false)
    if (indexesRef.current.length) {
      const isNextArgQuery = command?.arguments?.[prevArgsLength + 1]?.name === DefinedArgumentName.query
      return asSuggestionsRef(getIndexesSuggestions(indexesRef.current, range, isNextArgQuery))
    }
    return asSuggestionsRef([])
  }

  const handleQuerySuggestions = (
    command: SearchCommand,
    foundArg: FoundCommandArgument,
  ) => {
    updateHelpWidget(true, command, foundArg?.stopArg)
    return asSuggestionsRef([], false)
  }

  const handleExpressionSuggestions = (
    value: string,
    foundArg: FoundCommandArgument,
    cursorContext: CursorContext,
    range: monacoEditor.IRange
  ) => {
    updateHelpWidget(true, foundArg?.parent, foundArg?.stopArg)

    const { isCursorInQuotes, offset, argLeftOffset } = cursorContext
    if (!isCursorInQuotes) return asSuggestionsRef([])

    const stringBeforeCursor = value.substring(argLeftOffset, offset) || ''
    const { args } = splitQueryByArgs(
      stringBeforeCursor.replace(/^["']|["']$/g, ''),
      offset - argLeftOffset
    )
    const [, [currentArg]] = args

    const functions = foundArg?.stopArg?.arguments ?? []

    const suggestions = getFunctionsSuggestions(functions, range)
    const isStartsWithFunction = functions.some(({ token }) => token?.startsWith(currentArg))
    return asSuggestionsRef(suggestions, true, isStartsWithFunction)
  }

  const handleCommonSuggestions = (
    value: string,
    foundArg: Nullable<FoundCommandArgument>,
    allArgs: string[],
    cursorContext: CursorContext,
    range: monacoEditor.IRange
  ) => {
    if (foundArg?.stopArg?.expression) return handleExpressionSuggestions(value, foundArg, cursorContext, range)

    const { prevCursorChar, nextCursorChar, isCursorInQuotes } = cursorContext
    if (isCursorInQuotes || nextCursorChar?.trim()) return asSuggestionsRef([])
    if ((prevCursorChar?.trim() || isCursorInQuotes) && isEscapedSuggestions.current) return asSuggestionsRef([])

    const { suggestions, forceHide, helpWidgetData } = getGeneralSuggestions(
      foundArg,
      allArgs,
      range,
      attributesRef.current
    )

    if (helpWidgetData) updateHelpWidget(helpWidgetData.isOpen, helpWidgetData.parent, helpWidgetData.currentArg)
    return asSuggestionsRef(suggestions, forceHide)
  }

  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language={MonacoLanguage.RediSearch}
      theme={theme === Theme.Dark ? RedisearchMonacoTheme.dark : RedisearchMonacoTheme.light}
      options={options}
      editorDidMount={editorDidMount}
    />
  )
}

export default Query
