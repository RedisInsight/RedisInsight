import * as monacoEditor from 'monaco-editor'
import { MarkerSeverity } from 'monaco-editor'
import { isNull } from 'lodash'
import { ICommands } from 'uiSrc/constants'
import { generateArgsNames } from 'uiSrc/utils/commands'
import { findCommandEarlier } from './monacoUtils'

export const getRedisSignatureHelpProvider = (commandsSpec: ICommands, commandsArray: string[]):
monacoEditor.languages.SignatureHelpProvider =>
// generate signature help provider
  ({
    // signatureHelpTriggerCharacters: [' '],
    // signatureHelpRetriggerCharacters: [' '],
    provideSignatureHelp: (
      model:monacoEditor.editor.IModel,
      position:monacoEditor.Position,
    ) => {
      const command = findCommandEarlier(model, position, commandsSpec, commandsArray)
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn - 1,
        endColumn: word.endColumn + 1
      }
      const query = model.getValueInRange(range)
      if (isNull(command)) {
        monacoEditor.editor.setModelMarkers(model, '', [])
        return null
      }
      console.log(11111, query)

      if (command.name === 'GRAPH.QUERY' && query.startsWith('"') && query.endsWith('"')) {
        monacoEditor.editor.setModelMarkers(model, 'non-redis-syntax', [
          {
            severity: MarkerSeverity.Hint,
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
            message: 'Use Non-Redis Syntax',
          }
        ])
      } else {
        monacoEditor.editor.setModelMarkers(model, 'redis', [])
      }

      const commandArgs = command.info?.arguments ?? []
      const label: string = `${command?.name} ${generateArgsNames(commandArgs).join(' ')}`

      return {
        dispose: () => {},
        value: {
          activeParameter: 0,
          activeSignature: 0,
          signatures: [{
            label,
            parameters: [{ label: `${command?.name}` }]
          }]
        }
      }
    }
  })
