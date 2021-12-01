import * as monacoEditor from 'monaco-editor'
import { ICommand } from 'uiSrc/constants'

export interface IMonacoCommand {
  name: string
  info?: ICommand
  position?: monacoEditor.Position
}
