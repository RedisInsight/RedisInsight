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
import { SearchCommand } from 'uiSrc/pages/search/types'
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
  getMandatoryArgumentSuggestions,
  getOptionalSuggestions,
  getCommandsSuggestions, isIndexComplete
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

    setSelectedIndex(allArgs[1] || '')
    setSelectedCommand(commandName)

    // cover query
    if (command?.arguments?.[prevArgs.length]?.name === DefinedArgumentName.query) {
      updateHelpWidget(true, addOwnTokenToArgs(commandName, command), command?.arguments?.[prevArgs.length])

      if (prevCursorChar === '@') {
        helpWidgetRef.current.isOpen = false
        return asSuggestionsRef(getFieldsSuggestions(attributesRef.current, range), false)
      }

      return asSuggestionsRef([], false)
    }

    // cover index
    if (command?.arguments?.[prevArgs.length]?.name === DefinedArgumentName.index) {
      updateHelpWidget(true, addOwnTokenToArgs(commandName, command), command?.arguments?.[prevArgs.length])

      // we do not suggest indexes if there is something next
      if (currentOffsetArg) return asSuggestionsRef([], false)
      if (indexesRef.current.length) return asSuggestionsRef(getIndexesSuggestions(indexesRef.current, range))
      return asSuggestionsRef([])
    }

    if (isCursorInQuotes || nextCursorChar?.trim()) return asSuggestionsRef([])
    if (prevArgs.length < 2) return asSuggestionsRef([])
    if ((prevCursorChar?.trim() || isCursorInQuotes) && isEscapedSuggestions.current) return asSuggestionsRef([])
    isEscapedSuggestions.current = false

    const foundArg = findCurrentArgument(command?.arguments || [], prevArgs)
    updateHelpWidget(!!foundArg?.stopArg, foundArg?.parent, foundArg?.stopArg)

    if (foundArg && !foundArg.isComplete) return getMandatoryArgumentSuggestions(foundArg, attributesRef.current, range)
    if (!foundArg || foundArg.isComplete) {
      return getOptionalSuggestions(command, foundArg, allArgs, range, currentOffsetArg)
    }
    return asSuggestionsRef([])
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
