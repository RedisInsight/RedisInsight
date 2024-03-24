import React, { useEffect, useRef, useState } from 'react'
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
  query: string
  lang: string
  onSubmit: (query?: string) => void
  onCancel: () => void
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  height: number
  initialHeight: number
}

// paddings of main editor
const WRAPPER_PADDINGS_HEIGHT = 18
const BOTTOM_INDENT_PADDING = 6

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
const notCommandRegEx = /^\s|\/\//

function getWorkerUrl(moduleId, label) {
  if (['json', 'typescript', 'javascript'].includes(label)) {
    return `${label}.worker.js`
  }

  return 'editor.worker.js'
}

window.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label) => {
    let workerUrl = getWorkerUrl(moduleId, label)
    const proxyPath = window.__RIPROXYPATH__ || ''
    if (proxyPath) {
      workerUrl = proxyPath + '/' + workerUrl
    }
    return workerUrl
  }
}

const DedicatedEditor = (props: Props) => {
  const { height, initialHeight, query = '', lang, onCancel, onSubmit } = props
  const selectedLang = langs[lang]
  let contribution: Nullable<ISnippetController> = null

  const [value, setValue] = useState<string>(query)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const rndRef = useRef<Nullable<any>>(null)
  let disposeCompletionItemProvider = () => {}

  useEffect(() =>
  // componentWillUnmount
    () => {
      contribution?.dispose?.()
      disposeCompletionItemProvider()
    },
  [])

  useEffect(() => {
    if (height === 0) return

    const rndHeight = rndRef?.current.resizableElement.current.offsetHeight || 0
    const rndTop = rndRef?.current.draggable.state.y
    if (height < rndTop + rndHeight + WRAPPER_PADDINGS_HEIGHT) {
      rndRef?.current.updatePosition({ x: 0, y: height - rndHeight - WRAPPER_PADDINGS_HEIGHT })
    }
  }, [height])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = value.split('\n')
    const { monaco, editor } = monacoObjects.current

    const newDecorations = compact(commands.map((command, index) => {
      if (!command || notCommandRegEx.test(command)) return null
      const lineNumber = index + 1

      return toModelDeltaDecoration(
        decoration(monaco, `decoration_${lineNumber}`, lineNumber, 1, lineNumber, 1)
      )
    }))

    decorations = editor.deltaDecorations(decorations, newDecorations)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleSubmit = () => {
    const { editor } = monacoObjects?.current || {}
    const val = editor?.getValue()
      .split('\n')
      .map((line: string, i: number) => ((i > 0 && !notCommandRegEx.test(line)) ? `\t${line}` : line))
      .join('\n')
    onSubmit(val || '')
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

    setTimeout(() => editor.focus(), 0)

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
      ref={rndRef}
      default={{
        x: 0,
        y: initialHeight * 0.4 - BOTTOM_INDENT_PADDING,
        width: '100%',
        height: '60%'
      }}
      minHeight="80px"
      enableResizing={{
        top: true,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
      resizeHandleClasses={{
        top: 't_resize-top',
        bottom: 't_resize-bottom'
      }}
      dragAxis="y"
      bounds=".editorBounder"
      dragHandleClassName="draggable-area"
      className={styles.rnd}
      data-testid="draggable-area"
    >
      <div className={styles.container} onKeyDown={handleKeyDown} role="textbox" tabIndex={0}>
        <div className="draggable-area" />
        <div className={styles.input} data-testid="query-input-container">
          <MonacoEditor
            language={selectedLang?.id || MonacoLanguage.Cypher}
            value={value}
            onChange={setValue}
            options={options}
            className={`${lang}-editor`}
            editorDidMount={editorDidMount}
          />
        </div>
        <div className={cx(styles.actions)}>
          <span>{ selectedLang?.name }</span>
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
