import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { findIndex } from 'lodash'
import { decode } from 'html-entities'
import cx from 'classnames'
import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor from 'react-monaco-editor'
import { useParams } from 'react-router-dom'

import {
  Theme,
  MonacoLanguage,
  redisLanguageConfig,
  KEYBOARD_SHORTCUTS,
} from 'uiSrc/constants'
import {
  getMultiCommands,
  getRedisCompletionProvider,
  getRedisMonarchTokensProvider,
  removeMonacoComments,
  splitMonacoValuePerLines
} from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { KeyboardShortcut } from 'uiSrc/components'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  loading: boolean;
  setQueryEl: Function;
  setQuery: (script: string) => void;
  onSubmit: (query?: string, historyId?: number, type?: WBQueryType) => void;
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void;
}

const Query = (props: Props) => {
  const { query = '', setQuery, onKeyDown, onSubmit, setQueryEl } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const {
    commandsArray: REDIS_COMMANDS_ARRAY,
    spec: REDIS_COMMANDS_SPEC
  } = useSelector(appRedisCommandsSelector)
  const editorRef = React.createRef<MonacoEditor>()
  const { theme } = useContext(ThemeContext)
  let disposeCompletionItemProvider = () => {}

  useEffect(() =>
  // componentWillUnmount
    () => {
      disposeCompletionItemProvider()
    },
  [])

  const onChange = (value: string = '') => {
    setQuery(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, query)
  }

  const sendEventSubmitTelemetry = (commandInit = query) => {
    const eventData = (() => {
      const commands = splitMonacoValuePerLines(commandInit)

      const [commandLine, ...rest] = commands.map((command = '') => {
        const matchedCommand = REDIS_COMMANDS_ARRAY.find((commandName) =>
          command.toUpperCase().startsWith(commandName))
        return matchedCommand ?? command.split(' ')?.[0]
      })
      const multiCommands = getMultiCommands(rest)

      const command = removeMonacoComments(decode([commandLine, multiCommands].join('\n')).trim())

      return {
        command,
        databaseId: instanceId,
        multiple: multiCommands ? 'Multiple' : 'Single'
      }
    })()

    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_COMMAND_SUBMITTED,
      eventData
    })
  }

  const handleSubmit = (value?: string) => {
    sendEventSubmitTelemetry(value)

    onSubmit(value)
  }

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editor.focus()
    setQueryEl(editor)

    setupMonacoRedisLang(monaco)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => handleSubmit(editor.getValue())
    )
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
          ref={editorRef}
          language={MonacoLanguage.Redis}
          theme={theme === Theme.Dark ? 'vs-dark' : 'vs-light'}
          value={query}
          options={options}
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
