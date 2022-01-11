import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

export interface IEditorMount {
  editor: monacoEditor.editor.IStandaloneCodeEditor
  monaco: typeof monacoEditor
}

export interface ISnippetController extends monacoEditor.editor.IEditorContribution {
  isInSnippet: () => boolean
  finish: () => boolean
  cancel: () => boolean
}
