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
} from 'uiSrc/constants'
import {
  actionTriggerParameterHints,
  decoration,
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

let decorations: string[] = []

const Query = (props: Props) => {
  const { query = '', setQuery, onKeyDown, onSubmit, setQueryEl } = props
  let contribution: Nullable<ISnippetController> = null

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

    if (isTriggerHints) {
      actionTriggerParameterHints(editor)
    }
  }

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

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    if (contribution?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(new monaco.Selection(lineNumber, column, lineNumber, column))
      contribution?.cancel?.()
    }
  }

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter until no answer from monaco authors
    // https://github.com/microsoft/monaco-editor/issues/2756
    contribution = editor.getContribution<ISnippetController>('snippetController2')

    editor.focus()
    setQueryEl(editor)

    editor.onKeyDown(onKeyDownMonaco)

    setupMonacoRedisLang(monaco)
    editor.addAction(
      getMonacoAction(MonacoAction.Submit, (editor) => handleSubmit(editor.getValue()), monaco)
    )
    editor.addAction({
      // An unique identifier of the contributed action.
      id: 'my-unique-id',

      // A label of the action that will be presented to the user.
      label: 'My Label!!!',

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
        // chord
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_0,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_1
        )
      ],

      contextMenuGroupId: 'navigation',

      contextMenuOrder: 1.5,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run(ed) {
        alert(`i'm running => ${ed.getPosition()}`)
      }
    })
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
      getRedisSignatureHelpProvider(REDIS_COMMANDS_SPEC, REDIS_COMMANDS_ARRAY)
    ).dispose

    monaco.languages.setLanguageConfiguration(MonacoLanguage.Redis, redisLanguageConfig)
    monaco.languages.setMonarchTokensProvider(
      MonacoLanguage.Redis,
      getRedisMonarchTokensProvider(REDIS_COMMANDS_ARRAY)
    )
    monaco.languages.registerCodeActionProvider(MonacoLanguage.Redis, {
      provideCodeActions(
        model: monaco.editor.ITextModel,
        _range: any,
        context: monaco.languages.CodeActionContext,
      ): monaco.languages.ProviderResult<monaco.languages.CodeActionList> {
        // console.log(22, context.markers)
        const actions = context.markers.map((error): monaco.languages.CodeAction => ({
          title: 'Cypher',
          command: {
            id: MonacoAction.Submit,
            title: 'User Cypher',
            tooltip: 'Use cypher tooltip'
          },
          diagnostics: [error],
          kind: 'action',
          isPreferred: true
        }))
        return {
          actions,
          dispose: () => {}
        }
      }
    })
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

export default Query
