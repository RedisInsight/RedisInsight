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
  args: [string[], string[]],
  cursor: {
    isCursorInQuotes: boolean,
    prevCursorChar: string,
    nextCursorChar: string,
    argLeftOffset: number,
    argRightOffset: number
  }
  allArgs: string[]
  info?: ICommand
  commandPosition: any
  position?: monacoEditor.Position
  commandCursorPosition?: number
}
