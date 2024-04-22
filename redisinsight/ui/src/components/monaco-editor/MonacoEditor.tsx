import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactMonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import cx from 'classnames'
import { EuiButton, EuiIcon } from '@elastic/eui'
import { darkTheme, lightTheme, MonacoThemes } from 'uiSrc/constants/monaco/cypher'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount, ISnippetController } from 'uiSrc/pages/workbench/interfaces'
import { DSL, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import DedicatedEditor from './components/dedicated-editor'
import styles from './styles.module.scss'

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
  onEditorWillMount?: (monaco: typeof monacoEditor) => void
  className?: string
  language: string
  dedicatedEditorLanguages?: DSL[]
}
const MonacoEditor = (props: Props) => {
  const {
    value,
    onChange,
    onApply,
    onDecline,
    onEditorDidMount,
    onEditorWillMount,
    disabled,
    readOnly,
    isEditable,
    language,
    wrapperClassName,
    className,
    options = {},
    dedicatedEditorLanguages = [],
    'data-testid': dataTestId = 'monaco-editor'
  } = props

  let contribution: Nullable<ISnippetController> = null
  const [isEditing, setIsEditing] = useState(!readOnly && !disabled)
  const [isDedicatedEditorOpen, setIsDedicatedEditorOpen] = useState(false)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const input = useRef<HTMLDivElement>(null)

  const { theme } = useContext(ThemeContext)

  useEffect(() =>
  // componentWillUnmount
    () => {
      contribution?.dispose?.()
    },
  [])

  useEffect(() => {
    monacoObjects.current?.editor.updateOptions({ readOnly: !isEditing && (disabled || readOnly) })
  }, [disabled, readOnly, isEditing])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter until no answer from monaco authors
    // https://github.com/microsoft/monaco-editor/issues/2756
    contribution = editor.getContribution<ISnippetController>('snippetController2')

    editor.onKeyDown(onKeyDownMonaco)

    if (dedicatedEditorLanguages?.length) {
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Space, () => {
        onPressWidget()
      })
    }

    onEditorDidMount?.(editor, monaco)
  }

  const editorWillMount = (monaco: typeof monacoEditor) => {
    onEditorWillMount?.(monaco)
  }

  const onKeyDownMonaco = (e: monacoEditor.IKeyboardEvent) => {
    // trigger parameter hints
    if (e.keyCode === monacoEditor.KeyCode.Enter || e.keyCode === monacoEditor.KeyCode.Space) {
      onExitSnippetMode()
    }
  }

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    if (contribution?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(new monacoEditor.Selection(lineNumber, column, lineNumber, column))
      contribution?.cancel?.()
    }
  }

  const onPressWidget = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    setIsDedicatedEditorOpen(true)
    editor.updateOptions({ readOnly: true })
  }

  const triggerUpdateCursorPosition = (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
    const position = editor.getPosition()
    editor.trigger('mouse', '_moveTo', { position: { lineNumber: 1, column: 1 } })
    editor.trigger('mouse', '_moveTo', { position })
    editor.focus()
  }

  const updateArgFromDedicatedEditor = (value: string = '') => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    const model = editor.getModel()
    if (!model) return

    const position = editor.getPosition()

    editor.updateOptions({ readOnly: false })
    editor.executeEdits(null, [
      {
        range: new monacoEditor.Range(
          position?.lineNumber!,
          position?.column!,
          position?.lineNumber!,
          position?.column! + value.length,
        ),
        text: value.replaceAll('\n', ' ')
      }
    ])
    setIsDedicatedEditorOpen(false)
    triggerUpdateCursorPosition(editor)
  }

  const onCancelDedicatedEditor = () => {
    setIsDedicatedEditorOpen(false)
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    editor.updateOptions({ readOnly: false })
    triggerUpdateCursorPosition(editor)
  }

  if (monacoEditor?.editor) {
    monacoEditor.editor.defineTheme(MonacoThemes.Dark, darkTheme)
    monacoEditor.editor.defineTheme(MonacoThemes.Light, lightTheme)
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
        <div className="inlineMonacoEditor" data-testid={`wrapper-${dataTestId}`} ref={input}>
          <ReactMonacoEditor
            language={language}
            theme={theme === Theme.Dark ? 'dark' : 'light'}
            value={value ?? ''}
            onChange={onChange}
            options={monacoOptions}
            className={cx(styles.editor, className, { readMode: !isEditing && readOnly })}
            editorDidMount={editorDidMount}
            editorWillMount={editorWillMount}
            data-testid={dataTestId}
          />
        </div>
      </InlineItemEditor>
      {isDedicatedEditorOpen && (
        <DedicatedEditor
          initialHeight={input?.current?.scrollHeight || 0}
          langs={dedicatedEditorLanguages}
          onSubmit={updateArgFromDedicatedEditor}
          onCancel={onCancelDedicatedEditor}
        />
      )}
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
