import React, { useContext, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { compact, findIndex } from 'lodash'
import cx from 'classnames'
import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor from 'react-monaco-editor'

import {
  Theme,
  MonacoLanguage,
  redisLanguageConfig,
  KEYBOARD_SHORTCUTS,
} from 'uiSrc/constants'
import {
  decoration,
  geMonacoAction,
  getRedisCompletionProvider,
  getRedisMonarchTokensProvider,
  MonacoAction,
  Nullable,
  toModelDeltaDecoration
} from 'uiSrc/utils'
import { KeyboardShortcut } from 'uiSrc/components'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  loading: boolean;
  setQueryEl: Function;
  setQuery: (script: string) => void;
  onSubmit: (query?: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void;
}

interface IEditorMount {
  editor: monacoEditor.editor.IStandaloneCodeEditor
  monaco: typeof monacoEditor
}

let decorations: string[] = []

const Query = (props: Props) => {
  const { query = '', setQuery, onKeyDown, onSubmit, setQueryEl } = props

  const {
    commandsArray: REDIS_COMMANDS_ARRAY,
    spec: REDIS_COMMANDS_SPEC
  } = useSelector(appRedisCommandsSelector)
  const { theme } = useContext(ThemeContext)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  let disposeCompletionItemProvider = () => {}

  useEffect(() =>
  // componentWillUnmount
    () => {
      disposeCompletionItemProvider()
    },
  [])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = query.split('\n')
    const { monaco, editor } = monacoObjects.current
    const notCommandRegEx = /^[\s|//]/

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

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    monacoObjects.current = { editor, monaco }

    editor.focus()
    setQueryEl(editor)

    setupMonacoRedisLang(monaco)
    editor.addAction(geMonacoAction(MonacoAction.Submit, (editor) => handleSubmit(editor.getValue()), monaco))
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
    lineNumbersMinChars: 4
    // fontFamily: 'Inconsolata',
    // fontSize: 16,
    // minimap: {
    //   enabled: false,
    // },
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
