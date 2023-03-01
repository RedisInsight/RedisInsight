import React, { useContext, useEffect, useRef } from 'react'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import cx from 'classnames'
import { darkTheme, lightTheme, MonacoThemes } from 'uiSrc/constants/monaco/cypher'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import styles from './styles.modules.scss'

export interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  wrapperClassName?: string
  'data-testid'?: string
}
const MonacoJson = (props: Props) => {
  const {
    value,
    onChange,
    disabled,
    wrapperClassName,
    'data-testid': dataTestId
  } = props
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    monacoObjects.current?.editor.updateOptions({ readOnly: disabled })
  }, [disabled])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemaRequest: 'error',
      trailingCommas: 'error'
    })
  }

  if (monaco?.editor) {
    monaco.editor.defineTheme(MonacoThemes.Dark, darkTheme)
    monaco.editor.defineTheme(MonacoThemes.Light, lightTheme)
  }

  const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    wordWrap: 'on',
    automaticLayout: true,
    formatOnPaste: false,
    padding: { top: 10 },
    suggest: {
      preview: false,
      showStatusBar: false,
      showIcons: false,
      showProperties: false,
    },
    quickSuggestions: false,
    minimap: {
      enabled: false,
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    lineNumbersMinChars: 4,
  }

  return (
    <div className={cx(styles.wrapper, wrapperClassName, { disabled })}>
      <MonacoEditor
        language="json"
        theme={theme === Theme.Dark ? 'dark' : 'light'}
        value={value}
        onChange={onChange}
        options={options}
        className="json-monaco-editor"
        editorDidMount={editorDidMount}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default MonacoJson
