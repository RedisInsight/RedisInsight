import React, { useContext, useEffect, useRef, useState } from 'react'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import ReactMonacoEditor, { monaco } from 'react-monaco-editor'
import cx from 'classnames'
import { EuiButton, EuiIcon } from '@elastic/eui'
import { darkTheme, lightTheme, MonacoThemes } from 'uiSrc/constants/monaco/cypher'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import styles from './styles.modules.scss'

export interface CommonProps {
  value: string
  onChange?: (value: string) => void
  onApply?: (
    event: React.MouseEvent,
    closeEditor: () => void
  ) => void
  onDecline?: (event?: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
  readOnly?: boolean
  isEditable?: boolean
  wrapperClassName?: string
  options?: monacoEditor.editor.IStandaloneEditorConstructionOptions
  'data-testid'?: string
}

export interface Props extends CommonProps {
  onEditorDidMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => void
  className?: string
  language: string
}
const MonacoEditor = (props: Props) => {
  const {
    value,
    onChange,
    onApply,
    onDecline,
    onEditorDidMount,
    disabled,
    readOnly,
    isEditable,
    language,
    wrapperClassName,
    className,
    options = {},
    'data-testid': dataTestId = 'monaco-editor'
  } = props

  const [isEditing, setIsEditing] = useState(!readOnly && !disabled)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    monacoObjects.current?.editor.updateOptions({ readOnly: !isEditing && (disabled || readOnly) })
  }, [disabled, readOnly, isEditing])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }
    onEditorDidMount?.(editor, monaco)
  }

  if (monaco?.editor) {
    monaco.editor.defineTheme(MonacoThemes.Dark, darkTheme)
    monaco.editor.defineTheme(MonacoThemes.Light, lightTheme)
  }

  const monacoOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
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
    ...options
  }

  const handleApply = (_value: string, event: React.MouseEvent) => {
    onApply?.(event, () => setIsEditing(false))
  }

  const handleDecline = (event?: React.MouseEvent<HTMLElement>) => {
    setIsEditing(false)
    onDecline?.(event)
  }

  return (
    <div className={cx(styles.wrapper, wrapperClassName, { disabled, [styles.isEditing]: isEditing && readOnly })}>
      <InlineItemEditor
        onApply={handleApply}
        onDecline={handleDecline}
        viewChildrenMode={!isEditing || !readOnly}
        declineOnUnmount={false}
        preventOutsideClick
      >
        <div className="inlineMonacoEditor" data-testid={`wrapper-${dataTestId}`}>
          <ReactMonacoEditor
            language={language}
            theme={theme === Theme.Dark ? 'dark' : 'light'}
            value={value ?? ''}
            onChange={onChange}
            options={monacoOptions}
            className={cx(styles.editor, className, { readMode: !isEditing && readOnly })}
            editorDidMount={editorDidMount}
            data-testid={dataTestId}
          />
        </div>
      </InlineItemEditor>
      {isEditable && readOnly && !isEditing && (
        <EuiButton
          fill
          color="secondary"
          onClick={() => setIsEditing(true)}
          className={styles.editBtn}
          data-testid="edit-monaco-value"
        >
          <EuiIcon type="pencil" />
        </EuiButton>
      )}
    </div>
  )
}

export default MonacoEditor
