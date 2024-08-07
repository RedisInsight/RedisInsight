import React, { useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { useDispatch, useSelector } from 'react-redux'

import { MonacoLanguage, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import {
  findCurrentArgument,
  getRange,
  getRediSearchSignutureProvider, setCursorPositionAtTheEnd,
  splitQueryByArgs
} from 'uiSrc/pages/search/utils'
import { SearchCommand } from 'uiSrc/pages/search/types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { fetchRedisearchInfoAction } from 'uiSrc/slices/browser/redisearch'
import { SUPPORTED_COMMANDS_LIST, options, DefinedArgumentName } from './constants'
import {
  getFieldsSuggestions,
  getIndexesSuggestions,
  asSuggestionsRef,
  getMandatoryArgumentSuggestions, getOptionalSuggestions, getCommandsSuggestions
} from './utils'

export interface Props {
  value: string
  onChange: (val: string) => void
  indexes: RedisResponseBuffer[]
}

const Query = (props: Props) => {
  const { value, onChange, indexes } = props
  const { spec: REDIS_COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)

  const [selectedIndex, setSelectedIndex] = useState('')

  const SUPPORTED_COMMANDS = SUPPORTED_COMMANDS_LIST.map((name) => ({
    ...REDIS_COMMANDS_SPEC[name],
    name
  })) as unknown as SearchCommand[]

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
    if (!selectedIndex) return

    const index = selectedIndex.replace(/^(['"])(.*)\1$/, '$2')

    dispatch(fetchRedisearchInfoAction(index,
      (data) => {
        const { attributes } = data as any
        attributesRef.current = attributes
      }))
  }, [selectedIndex])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monaco.languages.register({ id: MonacoLanguage.RediSearch })
    monacoObjects.current = { editor, monaco }

    if (value) {
      setCursorPositionAtTheEnd(editor)
    } else {
      const position = editor.getPosition()

      if (position?.column === 1 && position?.lineNumber === 1) {
        suggestionsRef.current = getSuggestions(editor)
        triggerSuggestions()
      }
    }

    disposeSignatureHelpProvider.current?.()
    disposeSignatureHelpProvider.current = monaco.languages.registerSignatureHelpProvider(MonacoLanguage.RediSearch, {
      provideSignatureHelp: (): any => getRediSearchSignutureProvider(helpWidgetRef?.current)
    }).dispose

    disposeCompletionItemProvider.current?.()
    disposeCompletionItemProvider.current = monaco.languages.registerCompletionItemProvider(MonacoLanguage.RediSearch, {
      provideCompletionItems: (): monacoEditor.languages.CompletionList =>
        ({ suggestions: suggestionsRef.current.data })
    }).dispose

    editor.onDidChangeCursorPosition(handleCursorChange)
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
      triggerSuggestions()
      helpWidgetRef.current.isOpen = false
      return
    }

    if (suggestionsRef.current.forceHide) {
      setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
      editor?.trigger('', 'editor.action.triggerParameterHints', '')
    }
  }

  const triggerSuggestions = () => {
    const { monaco, editor } = monacoObjects.current || {}
    if (!monaco) return

    setTimeout(() => editor?.trigger('', 'editor.action.triggerSuggest', { auto: false }))
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

    const { args, isCursorInArg, prevCursorChar, nextCursorChar } = splitQueryByArgs(value, offset)
    const allArgs = args.flat()
    const [beforeOffsetArgs] = args
    const [firstArg, ...prevArgs] = beforeOffsetArgs

    const commandName = firstArg?.toUpperCase()
    const command = REDIS_COMMANDS_SPEC[commandName] as unknown as SearchCommand

    if (!command && position.lineNumber === 1 && word.startColumn === 1) {
      return getCommandsSuggestions(SUPPORTED_COMMANDS, range)
    }

    if (!command) return asSuggestionsRef([])

    setSelectedIndex(allArgs[1] || '')

    // cover query
    if (command?.arguments?.[prevArgs.length]?.name === DefinedArgumentName.query) {
      if (prevCursorChar === '@') {
        return asSuggestionsRef(getFieldsSuggestions(attributesRef.current, range), false)
      }

      return asSuggestionsRef([])
    }

    if (isCursorInArg || nextCursorChar?.trim()) return asSuggestionsRef([])

    // cover index field
    if (command?.arguments?.[prevArgs.length]?.name === DefinedArgumentName.index) {
      if (prevCursorChar?.trim()) return asSuggestionsRef([], false)
      return asSuggestionsRef(getIndexesSuggestions(indexesRef.current, range))
    }

    if (prevArgs.length < 2) return asSuggestionsRef([])

    const foundArg = findCurrentArgument(command?.arguments || [], prevArgs)

    helpWidgetRef.current = {
      isOpen: !!foundArg?.stopArg,
      parent: foundArg?.parent,
      currentArg: foundArg?.stopArg
    }

    if (foundArg && !foundArg.isComplete) return getMandatoryArgumentSuggestions(foundArg, attributesRef.current, range)
    if (!foundArg || foundArg.isComplete) return getOptionalSuggestions(command, foundArg, allArgs, range)
    return asSuggestionsRef([])
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
