import * as monacoEditor from 'monaco-editor'
import { ICommand, ICommandArgGenerated, ICommands } from 'uiSrc/constants'
import { generateArgs, generateArgsNames } from 'uiSrc/utils/commands'

type DependencyProposals = {
  [key: string]: monacoEditor.languages.CompletionItem
}

const getCommandMarkdown = (command: ICommand): string => {
  const lines: string[] = [command?.summary]
  if (command?.arguments?.length) {
    // TODO: use i18n file for texts
    lines.push('### Arguments:')
    generateArgs(command.arguments).forEach((arg: ICommandArgGenerated): void => {
      const { multiple, optional } = arg
      const type: string = multiple ? 'multiple' : optional ? 'optional' : 'required'
      const argDescription: string = `_${type}_ \`${arg.generatedName}\``
      lines.push(argDescription)
    })
  }
  return lines.join('\n'.repeat(2))
}

const createDependencyProposals = (commandsSpec: ICommands): DependencyProposals => {
  const result: DependencyProposals = {}
  const commandsArr = Object.keys(commandsSpec).sort()
  commandsArr.forEach((command: string) => {
    const commandInfo: ICommand = commandsSpec[command]
    const range = { startLineNumber: 0, endLineNumber: 0, startColumn: 0, endColumn: 0 }
    const commandArgs = commandInfo?.arguments || []
    const detail: string = `${command} ${generateArgsNames(commandArgs).join(' ')}`
    const argsNames = generateArgsNames(commandArgs, false, true)
    const insertText = `${command} ${
      !argsNames.length ? '' : argsNames.join(' ').split(' ')
        .map((arg: string, i: number) => `\${${i + 1}:${arg}} `)
        .join('')}`

    result[command] = {
      label: command,
      kind: monacoEditor.languages.CompletionItemKind.Function,
      detail,
      insertText,
      documentation: {
        value: getCommandMarkdown(commandsSpec[command]),
      },
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    }
  })

  return result
}

export const getRedisCompletionProvider = (commandsSpec: ICommands):
monacoEditor.languages.CompletionItemProvider => {
  // generate completion item for each redis command
  const dependencyProposals = createDependencyProposals(commandsSpec)
  const commandsArr = Object.keys(commandsSpec).sort()

  return {
    provideCompletionItems: (
      model: monacoEditor.editor.IModel,
      position: monacoEditor.Position
    ): monacoEditor.languages.CompletionList => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: word.endColumn
      }
      // display suggestions only for words that don't belong to a folding area
      if (!model.getValueInRange(range).startsWith(' ')) {
        return {
          suggestions: commandsArr.map((command: string) => (
            {
              ...dependencyProposals[command],
              range
            }
          ))
        }
      }
      return { suggestions: [] }
    },
  }
}
