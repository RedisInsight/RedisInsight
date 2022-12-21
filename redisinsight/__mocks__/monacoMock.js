import React, { useEffect } from 'react';

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
        executeEdits: jest.fn()
      },
      // monaco
      {
        Range: jest.fn().mockImplementation(() => { return {} }),
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
        },
        KeyMod: {},
        KeyCode: {}
      })
  }, [])
  return <input {...props} data-testid="monaco"/>;
}

export const languages = {
  CompletionItemKind: {
    Function: 1
  },
  CompletionItemInsertTextRule: {
    InsertAsSnippet: 4
  }
}
