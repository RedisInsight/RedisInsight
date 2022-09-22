import * as monacoEditor from 'monaco-editor'

export enum MonacoAction {
  Submit = 'submit',
  ChangeGroupMode = 'change-group-mode'
}

export const getMonacoAction = (
  actionId: MonacoAction,
  action: (editor: monacoEditor.editor.IStandaloneCodeEditor, ...args: any[]) => void | Promise<void>,
  monaco: typeof monacoEditor,
): monacoEditor.editor.IActionDescriptor => {
  if (actionId === MonacoAction.Submit) {
    return {
      id: 'submit',
      label: 'Run Commands',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: action
    }
  }

  if (actionId === MonacoAction.ChangeGroupMode) {
    return {
      id: 'change-group-mode',
      label: 'Group Mode',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_G],
      run: action
    }
  }

  return { id: '', label: '', run: () => {} }
}

export const actionTriggerParameterHints = (editor:monacoEditor.editor.IStandaloneCodeEditor) =>
  editor.trigger('', 'editor.action.triggerParameterHints', '')
