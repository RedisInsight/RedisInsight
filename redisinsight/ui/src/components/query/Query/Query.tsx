import React, { useContext, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { compact, findIndex } from 'lodash'
import cx from 'classnames'
import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor, { monaco } from 'react-monaco-editor'

import {
  Theme,
  MonacoLanguage,
  redisLanguageConfig,
  KEYBOARD_SHORTCUTS,
  DSLNaming,
} from 'uiSrc/constants'
import {
  actionTriggerParameterHints,
  createSyntaxWidget,
  decoration,
  findArgIndexByCursor,
  findCompleteQuery,
  getMonacoAction,
  getRedisCompletionProvider,
  getRedisMonarchTokensProvider,
  getRedisSignatureHelpProvider,
  MonacoAction,
  Nullable,
  toModelDeltaDecoration
} from 'uiSrc/utils'
import { KeyboardShortcut } from 'uiSrc/components'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { IEditorMount, ISnippetController } from 'uiSrc/pages/workbench/interfaces'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  loading: boolean;
  setQueryEl: Function;
  setQuery: (script: string) => void;
  onSubmit: (query?: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void;
}

const SYNTAX_CONTEXT_ID = 'syntaxWidgetContext'
let decorations: string[] = []

const Query = (props: Props) => {
  const { query = '', setQuery, onKeyDown, onSubmit, setQueryEl } = props
  let contribution: Nullable<ISnippetController> = null
  const isWidgetOpen = useRef(false)
  const isWidgetEscaped = useRef(false)
  const selectedArg = useRef('')
  let syntaxWidgetContext: Nullable<monaco.editor.IContextKey<boolean>> = null

  const {
    commandsArray: REDIS_COMMANDS_ARRAY,
    spec: REDIS_COMMANDS_SPEC
  } = useSelector(appRedisCommandsSelector)
  const { theme } = useContext(ThemeContext)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  let disposeCompletionItemProvider = () => {}
  let disposeSignatureHelpProvider = () => {}

  useEffect(() =>
  // componentWillUnmount
    () => {
      contribution?.dispose?.()
      disposeCompletionItemProvider()
      disposeSignatureHelpProvider()
    },
  [])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = query.split('\n')
    const { monaco, editor } = monacoObjects.current
    const notCommandRegEx = /^\s|\/\//

    const newDecorations = compact(commands.map((command, index) => {
      if (!command || notCommandRegEx.test(command)) return null
      const lineNumber = index + 1

      return toModelDeltaDecoration(
        decoration(monaco, `decoration_${lineNumber}`, lineNumber, 1, lineNumber, 1)
      )
    }))

    decorations = editor.deltaDecorations(
      decorations,
      newDecorations
    )
  }, [query])

  const onChange = (value: string = '') => {
    setQuery(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, query)
  }

  const handleSubmit = (value?: string) => {
    onSubmit(value)
  }

  const onTriggerParameterHints = () => {
    if (!monacoObjects.current) return

    const { editor } = monacoObjects?.current
    const model = editor.getModel()
    const { lineNumber = 0 } = editor.getPosition() ?? {}
    const lineContent = model?.getLineContent(lineNumber)?.trim() ?? ''
    const matchedCommand = REDIS_COMMANDS_ARRAY.find((command) => lineContent?.trim().startsWith(command)) ?? ''
    // trigger parameter hints only ones between command and arguments in the same line
    const isTriggerHints = lineContent.split(' ').length < (2 + matchedCommand.split(' ').length)

    if (isTriggerHints && !isWidgetOpen.current) {
      actionTriggerParameterHints(editor)
    }
  }

  const onTriggerContentWidget = (position: Nullable<monacoEditor.Position>, language: string = ''): monaco.editor.IContentWidget => ({
    getId: () => 'syntax.content.widget',
    getDomNode: () => createSyntaxWidget(`Use ${language} Syntax`, 'Shift+Space'),
    getPosition: () => ({
      position,
      preference: [
        monaco.editor.ContentWidgetPositionPreference.BELOW
      ]
    })
  })

  const onKeyDownMonaco = (e: monacoEditor.IKeyboardEvent) => {
    // trigger parameter hints
    if (
      e.keyCode === monaco.KeyCode.Tab
      || e.keyCode === monaco.KeyCode.Enter
      || (e.keyCode === monaco.KeyCode.Space && e.ctrlKey && e.shiftKey)
      || (e.keyCode === monaco.KeyCode.Space && !e.ctrlKey && !e.shiftKey)
    ) {
      onTriggerParameterHints()
    }

    if (e.keyCode === monaco.KeyCode.Enter || e.keyCode === monaco.KeyCode.Space) {
      onExitSnippetMode()
    }
  }

  const onKeyChangeCursorMonaco = (e: monaco.editor.ICursorPositionChangedEvent) => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current
    const model = editor.getModel()

    isWidgetOpen.current && hideSyntaxWidget(editor)

    if (!model) {
      return
    }

    const command = findCompleteQuery(model, e.position, REDIS_COMMANDS_SPEC, REDIS_COMMANDS_ARRAY)
    if (!command) {
      isWidgetEscaped.current = false
      return
    }

    const queryArgIndex = command.info?.arguments?.findIndex((arg) => arg.dsl) || -1
    const cursorPosition = command.commandCursorPosition || 0
    if (!command.args?.length || queryArgIndex < 0) {
      isWidgetEscaped.current = false
      return
    }

    const argIndex = findArgIndexByCursor(command.args, command.fullQuery, cursorPosition)
    if (argIndex === null) {
      isWidgetEscaped.current = false
      return
    }
    const queryArg = command.args[argIndex]
    if (queryArgIndex === argIndex && /^['"].*['"]$/.test(queryArg)) {
      if (isWidgetEscaped.current) return

      const arg = command.info?.arguments?.[argIndex]?.dsl || ''
      const lang = arg in DSLNaming ? DSLNaming[arg] : null
      lang && showSyntaxWidget(editor, e.position, lang)
      selectedArg.current = queryArg
    }
  }

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    if (contribution?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(new monaco.Selection(lineNumber, column, lineNumber, column))
      contribution?.cancel?.()
    }
  }

  const hideSyntaxWidget = (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
    editor.removeContentWidget(onTriggerContentWidget(null))
    syntaxWidgetContext?.set(false)
    isWidgetOpen.current = false
  }

  const showSyntaxWidget = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    position: monacoEditor.Position,
    language: string
  ) => {
    editor.addContentWidget(onTriggerContentWidget(position, language))
    isWidgetOpen.current = true
    syntaxWidgetContext?.set(true)
  }

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter until no answer from monaco authors
    // https://github.com/microsoft/monaco-editor/issues/2756
    contribution = editor.getContribution<ISnippetController>('snippetController2')

    syntaxWidgetContext = editor.createContextKey(SYNTAX_CONTEXT_ID, false)
    editor.focus()
    setQueryEl(editor)

    editor.onKeyDown(onKeyDownMonaco)
    editor.onDidChangeCursorPosition(onKeyChangeCursorMonaco)

    setupMonacoRedisLang(monaco)
    editor.addAction(
      getMonacoAction(MonacoAction.Submit, (editor) => handleSubmit(editor.getValue()), monaco)
    )

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Space, () => {
      alert(selectedArg.current.replace(/(^["']|["']$)/g, ''))
    }, SYNTAX_CONTEXT_ID)

    editor.addCommand(monaco.KeyCode.Escape, () => {
      hideSyntaxWidget(editor)
      isWidgetEscaped.current = true
    }, SYNTAX_CONTEXT_ID)
  }

  const setupMonacoRedisLang = (monaco: typeof monacoEditor) => {
    const languages = monaco.languages.getLanguages()
    const isRedisLangRegistered = findIndex(languages, { id: MonacoLanguage.Redis }) > -1
    if (!isRedisLangRegistered) {
      monaco.languages.register({ id: MonacoLanguage.Redis })
    }
    disposeCompletionItemProvider = monaco.languages.registerCompletionItemProvider(
      MonacoLanguage.Redis,
      getRedisCompletionProvider(REDIS_COMMANDS_SPEC)
    ).dispose

    disposeSignatureHelpProvider = monaco.languages.registerSignatureHelpProvider(
      MonacoLanguage.Redis,
      getRedisSignatureHelpProvider(REDIS_COMMANDS_SPEC, REDIS_COMMANDS_ARRAY, isWidgetOpen)
    ).dispose

    monaco.languages.setLanguageConfiguration(MonacoLanguage.Redis, redisLanguageConfig)
    monaco.languages.setMonarchTokensProvider(
      MonacoLanguage.Redis,
      getRedisMonarchTokensProvider(REDIS_COMMANDS_ARRAY)
    )
  }

  const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    tabCompletion: 'on',
    wordWrap: 'on',
    padding: { top: 10 },
    automaticLayout: true,
    formatOnPaste: false,
    glyphMargin: true,
    suggest: {
      preview: true,
      showStatusBar: true,
      showIcons: false,
    },
    lineNumbersMinChars: 4
  }

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} role="textbox" tabIndex={0}>
      <div className={styles.input} data-testid="query-input-container">
        <MonacoEditor
          language={MonacoLanguage.Redis}
          theme={theme === Theme.Dark ? 'vs-dark' : 'vs-light'}
          value={query}
          options={options}
          className={`${MonacoLanguage.Redis}-editor`}
          onChange={onChange}
          editorDidMount={editorDidMount}
        />
      </div>
      <div className={styles.actions}>
        <EuiToolTip
          position="left"
          content={
            KEYBOARD_SHORTCUTS?.workbench?.runQuery && (
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <EuiText size="s">{`${KEYBOARD_SHORTCUTS.workbench.runQuery?.label}:\u00A0\u00A0`}</EuiText>
                <KeyboardShortcut
                  separator={KEYBOARD_SHORTCUTS?._separator}
                  items={KEYBOARD_SHORTCUTS.workbench.runQuery.keys}
                />
              </div>
            )
          }
        >
          <EuiButtonIcon
            onClick={() => handleSubmit()}
            iconType="playFilled"
            className={cx(styles.submitButton)}
            aria-label="submit"
            data-testid="btn-submit"
          />
        </EuiToolTip>
      </div>
    </div>
  )
}

export default React.memo(Query)
