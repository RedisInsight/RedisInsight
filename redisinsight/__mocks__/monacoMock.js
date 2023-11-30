import React, { useEffect } from 'react'

export default function MonacoEditor(props) {
  useEffect(() => {
    props.editorDidMount && props.editorDidMount(
      // editor
      {
        addCommand: jest.fn(),
        getContribution: jest.fn(),
        onKeyDown: jest.fn(),
        onMouseDown: jest.fn(),
        addAction: jest.fn(),
        getAction: jest.fn(),
        deltaDecorations: jest.fn(),
        createContextKey: jest.fn(),
        focus: jest.fn(),
        onDidChangeCursorPosition: jest.fn(),
        onDidAttemptReadOnlyEdit: jest.fn(),
        executeEdits: jest.fn(),
        updateOptions: jest.fn(),
        setSelection: jest.fn(),
      },
      // monaco
      {
        Range: jest.fn().mockImplementation(() => ({})),
        languages: {
          getLanguages: jest.fn(),
          register: jest.fn(),
          registerCompletionItemProvider: jest.fn().mockReturnValue({
            dispose: jest.fn()
          }),
          registerSignatureHelpProvider: jest.fn().mockReturnValue({
            dispose: jest.fn()
          }),
          setLanguageConfiguration: jest.fn(),
          setMonarchTokensProvider: jest.fn(),
          json: {
            jsonDefaults: {
              setDiagnosticsOptions: jest.fn()
            }
          }
        },
        KeyMod: {},
        KeyCode: {}
      }
    )
  }, [])
  return (
    <textarea
      {...props}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      data-testid={props['data-testid'] ? props['data-testid'] : 'monaco'}
    />
  )
}

export const languages = {
  CompletionItemKind: {
    Function: 1
  },
  CompletionItemInsertTextRule: {
    InsertAsSnippet: 4
  }
}

export const monaco = {
  Selection: jest.fn().mockImplementation(() => ({})),
  editor: {
    colorize: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    defineTheme: jest.fn(),
    setTheme: jest.fn()
  }
}
