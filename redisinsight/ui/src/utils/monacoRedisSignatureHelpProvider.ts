import { MutableRefObject } from 'react'
import * as monacoEditor from 'monaco-editor'
import { isNull } from 'lodash'
import { ICommands } from 'uiSrc/constants'
import { generateArgsNames } from 'uiSrc/utils/commands'
import { findCommandEarlier } from './monacoUtils'

export const getRedisSignatureHelpProvider = (
  commandsSpec: ICommands,
  commandsArray: string[],
  isBlockedRef?: MutableRefObject<boolean>
): monacoEditor.languages.SignatureHelpProvider =>
// generate signature help provider
  ({
    // signatureHelpTriggerCharacters: [' '],
    // signatureHelpRetriggerCharacters: [' '],
    provideSignatureHelp: (
      model:monacoEditor.editor.IModel,
      position:monacoEditor.Position,
    ) => {
      const command = findCommandEarlier(model, position, commandsSpec, commandsArray)

      if (isNull(command) || isBlockedRef?.current) {
        return null
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
