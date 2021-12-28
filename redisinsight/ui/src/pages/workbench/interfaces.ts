import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { Maybe } from 'uiSrc/utils'
import { IHistoryObject } from 'uiSrc/services/queryHistory'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { SendClusterCommandResponse, SendCommandResponse } from 'apiSrc/modules/cli/dto/cli.dto'

export interface WBHistoryObject extends IHistoryObject {
  id: number;
  query: string;
  data: SendClusterCommandResponse[] | SendCommandResponse | JSX.Element | string | null | undefined;
  status?: Maybe<CommandExecutionStatus>;
  loading?: boolean;
  time?: number
}

export interface IEditorMount {
  editor: monacoEditor.editor.IStandaloneCodeEditor
  monaco: typeof monacoEditor
}

export interface ISnippetController extends monacoEditor.editor.IEditorContribution {
  isInSnippet: () => boolean
  finish: () => boolean
  cancel: () => boolean
}
