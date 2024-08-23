import React, { useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { useDispatch } from 'react-redux'

import { ICommands, MonacoLanguage, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import {
  addOwnTokenToArgs,
  findCurrentArgInQuery,
  getRange,
  getRediSearchSignutureProvider,
  setCursorPositionAtTheEnd,
  splitQueryByArgs
} from 'uiSrc/pages/search/utils'
import { CommandContext, CursorContext, SearchCommand } from 'uiSrc/pages/search/types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { fetchRedisearchInfoAction } from 'uiSrc/slices/browser/redisearch'
import { getRediSearchMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokens'
import { installRedisearchTheme, RedisearchMonacoTheme } from 'uiSrc/utils/monaco/monacoThemes'
import { useDebouncedEffect } from 'uiSrc/services'
import { options, DefinedArgumentName } from './constants'
import {
  getFieldsSuggestions,
  getIndexesSuggestions,
  asSuggestionsRef,
  getCommandsSuggestions,
  isIndexComplete,
  getGeneralSuggestions
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
    const suggestModel = suggestController?.model

    return suggestModel?.state === 1
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

    const { args, isCursorInQuotes, prevCursorChar, nextCursorChar } = splitQueryByArgs(value, offset)

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

    const currentCommandArg = findCurrentArgInQuery(prevArgs, command)

    // cover index
    if (currentCommandArg?.name === DefinedArgumentName.index) {
      updateHelpWidget(true, addOwnTokenToArgs(commandName, command), currentCommandArg)
      return getIndexSuggestions(command, prevArgs.length, currentOffsetArg, range)
    }

    // cover query
    if (currentCommandArg?.name === DefinedArgumentName.query) {
      updateHelpWidget(true, addOwnTokenToArgs(commandName, command), currentCommandArg)

      return getQuerySuggestions(prevCursorChar, range)
    }

    if (isCursorInQuotes || nextCursorChar?.trim()) return asSuggestionsRef([])
    if ((prevCursorChar?.trim() || isCursorInQuotes) && isEscapedSuggestions.current) return asSuggestionsRef([])
    isEscapedSuggestions.current = false

    const cursorContext: CursorContext = { isCursorInQuotes, prevCursorChar, nextCursorChar, currentOffsetArg, range }
    const commandContext: CommandContext = { commandName, command, prevArgs, allArgs, currentCommandArg }

    const { suggestions, forceHide, helpWidgetData } = getGeneralSuggestions(
      commandContext,
      cursorContext,
      attributesRef.current
    )

    if (helpWidgetData) updateHelpWidget(helpWidgetData.isOpen, helpWidgetData.parent, helpWidgetData.currentArg)
    return asSuggestionsRef(suggestions, forceHide)
  }

  const getIndexSuggestions = (
    command: SearchCommand,
    prevArgsLength: number,
    currentOffsetArg: Nullable<string>,
    range: monacoEditor.IRange
  ) => {
    if (currentOffsetArg) return asSuggestionsRef([], false)
    if (indexesRef.current.length) {
      const isNextArgQuery = command?.arguments?.[prevArgsLength + 1]?.name === DefinedArgumentName.query
      return asSuggestionsRef(getIndexesSuggestions(indexesRef.current, range, isNextArgQuery))
    }
    return asSuggestionsRef([])
  }

  const getQuerySuggestions = (
    prevCursorChar: string,
    range: monacoEditor.IRange
  ) => {
    if (prevCursorChar === '@') {
      helpWidgetRef.current.isOpen = false
      return asSuggestionsRef(getFieldsSuggestions(attributesRef.current, range), false)
    }

    return asSuggestionsRef([], false)
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
