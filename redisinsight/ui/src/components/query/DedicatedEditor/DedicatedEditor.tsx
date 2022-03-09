import React, { useEffect, useRef } from 'react'
import { compact, findIndex } from 'lodash'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import { Rnd } from 'react-rnd'
import cx from 'classnames'
import { EuiButtonIcon } from '@elastic/eui'

import {
  DSL,
  DSLNaming,
  MonacoLanguage,
  MonacoSyntaxLang,
} from 'uiSrc/constants'
import {
  decoration,
  getMonacoAction,
  MonacoAction,
  Nullable,
  toModelDeltaDecoration
} from 'uiSrc/utils'
import { IEditorMount, ISnippetController } from 'uiSrc/pages/workbench/interfaces'
import { getCypherCompletionProvider } from 'uiSrc/utils/monaco/cypher/completionProvider'
import {
  cypherLanguageConfiguration,
} from 'uiSrc/constants/monaco/cypher'
import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/cypher/monarchTokensProvider'

import styles from './styles.module.scss'

export interface Props {
  value: string
  lang: string
  onSubmit: (query?: string) => void
  onCancel: () => void
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  width: number
}

const langs: MonacoSyntaxLang = {
  [DSL.cypher]: {
    name: DSLNaming[DSL.cypher],
    id: MonacoLanguage.Cypher,
    config: cypherLanguageConfiguration,
    completionProvider: getCypherCompletionProvider,
    tokensProvider: getCypherMonarchTokensProvider
  }
}
let decorations: string[] = []

const DedicatedEditor = (props: Props) => {
  const { width, value = '', lang, onCancel, onSubmit } = props
  const selectedLang = langs[lang]
  let contribution: Nullable<ISnippetController> = null
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  let disposeCompletionItemProvider = () => {}

  useEffect(() =>
  // componentWillUnmount
    () => {
      contribution?.dispose?.()
      disposeCompletionItemProvider()
    },
  [])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = value.split('\n')
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
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleSubmit = () => {
    const { editor } = monacoObjects?.current || {}
    onSubmit(editor?.getValue() || '')
  }

  const onKeyDownMonaco = (e: monacoEditor.IKeyboardEvent) => {
    // trigger parameter hints
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

    editor.onKeyDown(onKeyDownMonaco)

    setupMonacoLang(monaco)
    editor.addAction(
      getMonacoAction(MonacoAction.Submit, () => handleSubmit(), monaco)
    )
  }

  const setupMonacoLang = (monaco: typeof monacoEditor) => {
    const languages = monaco.languages.getLanguages()

    const selectedLang = langs[lang]
    if (!selectedLang) return

    const isLangRegistered = findIndex(languages, { id: selectedLang.id }) > -1
    if (!isLangRegistered) {
      monaco.languages.register({ id: selectedLang.id })
    }

    monaco.languages.setLanguageConfiguration(selectedLang.id, selectedLang.config)

    disposeCompletionItemProvider = monaco.languages.registerCompletionItemProvider(
      selectedLang.id,
      selectedLang.completionProvider()
    ).dispose

    monaco.languages.setMonarchTokensProvider(
      selectedLang.id,
      selectedLang.tokensProvider()
    )
  }

  const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    tabCompletion: 'on',
    wordWrap: 'on',
    padding: { top: 10 },
    automaticLayout: true,
    formatOnPaste: false,
    suggest: {
      preview: false,
      showStatusBar: false,
      showIcons: true,
    },
    minimap: {
      enabled: false
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    lineNumbersMinChars: 4
  }

  return (
    <Rnd
      default={{
        x: 17,
        y: 80,
        width,
        height: 240
      }}
      className={styles.rnd}
      dragHandleClassName="draggable-area"
    >
      <div className={styles.container} onKeyDown={handleKeyDown} role="textbox" tabIndex={0}>
        <div className="draggable-area" />
        <div className={styles.input} data-testid="query-input-container">
          <MonacoEditor
            language={selectedLang.id || MonacoLanguage.Cypher}
            value={value}
            options={options}
            className={`${lang}-editor`}
            editorDidMount={editorDidMount}
          />
        </div>
        <div className={cx(styles.actions)}>
          <span>{ selectedLang.name }</span>
          <div>
            <EuiButtonIcon
              iconSize="m"
              iconType="cross"
              color="primary"
              aria-label="Cancel editing"
              className={styles.declineBtn}
              onClick={onCancel}
              data-testid="cancel-btn"
            />
            <EuiButtonIcon
              iconSize="m"
              iconType="check"
              color="primary"
              type="submit"
              aria-label="Apply"
              onClick={handleSubmit}
              className={styles.applyBtn}
              data-testid="apply-btn"
            />
          </div>
        </div>
      </div>
    </Rnd>
  )
}

export default React.memo(DedicatedEditor)
