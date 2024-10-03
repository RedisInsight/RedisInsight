import React, { useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { useDispatch } from 'react-redux'

import { isNumber } from 'lodash'
import { MonacoLanguage, Theme } from 'uiSrc/constants'
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
import { useDebouncedEffect } from 'uiSrc/services'
import {
  options,
  DefinedArgumentName,
  FIELD_START_SYMBOL,
  COMMANDS_TO_GET_INDEX_INFO,
  EmptySuggestionsIds
} from './constants'
import {
  getFieldsSuggestions,
  getIndexesSuggestions,
  asSuggestionsRef,
  getCommandsSuggestions,
  isIndexComplete,
  getGeneralSuggestions,
  getFunctionsSuggestions,
  getNoIndexesSuggestion,
} from './utils'

export interface Props {
  value: string
  onChange: (val: string) => void
  indexes: RedisResponseBuffer[]
  supportedCommands?: SearchCommand[]
}

const Query = (props: Props) => {
  const { value, onChange, indexes, supportedCommands = [] } = props

  const [selectedCommand, setSelectedCommand] = useState('')
  const [selectedIndex, setSelectedIndex] = useState('')

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
      (data: any) => {
        attributesRef.current = data?.attributes || []
      }))
  }, 200, [selectedIndex])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monaco.languages.register({ id: MonacoLanguage.RediSearch })
    monacoObjects.current = { editor, monaco }

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
        ({ suggestions: suggestionsRef.current })
    }).dispose

    editor.onDidChangeCursorPosition(handleCursorChange)
    editor.onKeyDown((e: monacoEditor.IKeyboardEvent) => {
      if (e.keyCode === monacoEditor.KeyCode.Escape && isSuggestionsOpened()) {
        isEscapedSuggestions.current = true
      }
    })

    const suggestionWidget = editor.getContribution<any>('editor.contrib.suggestController')
    suggestionWidget.onWillInsertSuggestItem(({ item }: Record<'item', any>) => {
      if (item.completion.id === EmptySuggestionsIds.NoIndexes) {
        updateHelpWidget(true)
        editor.trigger('', 'hideSuggestWidget', null)
        editor.trigger('', 'editor.action.triggerParameterHints', '')
      }
    })

    suggestionsRef.current = getSuggestions(editor).data
    if (value) {
      setCursorPositionAtTheEnd(editor)
      return
    }

    const position = editor.getPosition()
    if (position?.column === 1 && position?.lineNumber === 1) {
      editor.focus()
      triggerSuggestions()
    }
  }

  const isSuggestionsOpened = () => {
    const { editor } = monacoObjects.current || {}
    if (!editor) return false
    const suggestController = editor.getContribution<any>('editor.contrib.suggestController')
    return suggestController?.model?.state === 1
  }

  const handleCursorChange = () => {
    const { editor } = monacoObjects.current || {}
    suggestionsRef.current = []

    if (!editor) return
    if (!editor.getSelection()?.isEmpty()) {
      editor?.trigger('', 'hideSuggestWidget', null)
      return
    }

    const { data, forceHide, forceShow } = getSuggestions(editor)
    suggestionsRef.current = data

    if (!forceShow) {
      editor.trigger('', 'editor.action.triggerParameterHints', '')
      return
    }

    if (data.length) {
      helpWidgetRef.current.isOpen = false
      triggerSuggestions()
      return
    }

    editor.trigger('', 'editor.action.triggerParameterHints', '')

    if (forceHide) {
      setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
    } else {
      helpWidgetRef.current.isOpen = !isSuggestionsOpened() && helpWidgetRef.current.isOpen
    }
  }

  const triggerSuggestions = () => {
    const { editor } = monacoObjects.current || {}
    setTimeout(() => editor?.trigger('', 'editor.action.triggerSuggest', { auto: false }))
  }

  const updateHelpWidget = (isOpen: boolean, parent?: SearchCommand, currentArg?: SearchCommand) => {
    helpWidgetRef.current = {
      isOpen,
      parent: parent || helpWidgetRef.current.parent,
      currentArg: currentArg || helpWidgetRef.current.currentArg }
  }

  const getSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor
  ): {
    forceHide: boolean
    forceShow: boolean
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
    const [firstArg] = beforeOffsetArgs

    if ((position.lineNumber === 1 && position.column === 1) || beforeOffsetArgs.length === 0) {
      return asSuggestionsRef(getCommandsSuggestions(COMMANDS_LIST, range), false)
    }

    const commandName = (firstArg || currentOffsetArg)?.toUpperCase()
    const command = COMMANDS_LIST.find(({ name }) => commandName === name)
    if (!command) {
      helpWidgetRef.current.isOpen = false
      return asSuggestionsRef([])
    }

    if (COMMANDS_TO_GET_INDEX_INFO.some((name) => name === commandName)) {
      setSelectedIndex(allArgs[1] || '')
    }

    setSelectedCommand(commandName)

    const cursorContext: CursorContext = { ...cursor, currentOffsetArg, offset }
    const foundArg = findCurrentArgument(COMMANDS_LIST, beforeOffsetArgs)

    if (prevCursorChar === FIELD_START_SYMBOL) return handleFieldSuggestions(foundArg, range)

    switch (foundArg?.stopArg?.name) {
      case DefinedArgumentName.index: {
        return handleIndexSuggestions(command, foundArg, currentOffsetArg, range)
      }
      case DefinedArgumentName.query: {
        return handleQuerySuggestions(command, foundArg)
      }
      default: {
        return handleCommonSuggestions(value, foundArg, allArgs, cursorContext, range)
      }
    }
  }

  const handleFieldSuggestions = (foundArg: Nullable<FoundCommandArgument>, range: monacoEditor.IRange) => {
    const isInQuery = foundArg?.stopArg?.name === DefinedArgumentName.query
    const fieldSuggestions = getFieldsSuggestions(attributesRef.current, range, true, isInQuery)
    return asSuggestionsRef(fieldSuggestions, true)
  }

  const handleIndexSuggestions = (
    command: SearchCommand,
    foundArg: FoundCommandArgument,
    currentOffsetArg: Nullable<string>,
    range: monacoEditor.IRange
  ) => {
    const isIndex = indexesRef.current.length > 0
    updateHelpWidget(isIndex, command, foundArg?.stopArg)

    if (!isIndex) {
      updateHelpWidget(!!currentOffsetArg)
      return asSuggestionsRef(!currentOffsetArg ? getNoIndexesSuggestion(range) : [], true)
    }

    if (!isIndex || currentOffsetArg) return asSuggestionsRef([], !currentOffsetArg)

    const argumentIndex = command?.arguments
      ?.findIndex(({ name }) => foundArg?.stopArg?.name === name)
    const isNextArgQuery = isNumber(argumentIndex)
      && command?.arguments?.[argumentIndex + 1]?.name === DefinedArgumentName.query

    return asSuggestionsRef(getIndexesSuggestions(indexesRef.current, range, isNextArgQuery))
  }

  const handleQuerySuggestions = (command: SearchCommand, foundArg: FoundCommandArgument) => {
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
    const expression = stringBeforeCursor.replace(/^["']|["']$/g, '')
    const { args } = splitQueryByArgs(expression, offset - argLeftOffset)
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
    const shouldHideSuggestions = isCursorInQuotes || nextCursorChar || (prevCursorChar && isEscapedSuggestions.current)
    if (shouldHideSuggestions) return asSuggestionsRef([])

    const {
      suggestions,
      forceHide,
      helpWidgetData
    } = getGeneralSuggestions(foundArg, allArgs, range, attributesRef.current)

    if (helpWidgetData) updateHelpWidget(helpWidgetData.isOpen, helpWidgetData.parent, helpWidgetData.currentArg)
    return asSuggestionsRef(suggestions, forceHide)
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
