import { monaco as monacoEditor } from 'react-monaco-editor'
import { ICommand } from 'uiSrc/constants'

export interface IMonacoCommand {
  name: string
  info?: ICommand
  position?: monacoEditor.Position
}

export interface IMonacoQuery {
  name: string
  fullQuery: string
  args?: string[]
  info?: ICommand
  commandPosition: any
  position?: monacoEditor.Position
  commandCursorPosition?: number
}
