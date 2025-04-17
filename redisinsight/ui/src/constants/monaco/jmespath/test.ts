import jmespath from 'jmespath'
import * as monaco from 'monaco-editor'

export const getJmespathCompletionsFromText = (text: string): string[] => {
  try {
    return jmespath.search({ data: true }, text)
  } catch (error) {
    console.error('Error during completion:', error)
    return []
  }
}

export const jmespathCompletionProvider: monaco.languages.CompletionItemProvider =
  {
    provideCompletionItems: (
      model: monaco.editor.ITextModel,
      position: monaco.Position,
    ) => {
      const text = model.getValue()
      const completions = getJmespathCompletionsFromText(text)

      const suggestions = completions.map((label) => {
        const range = model.getWordUntilPosition(position)

        return {
          label,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: label,
          detail: 'JMESPath function/field',
          range,
        }
      })

      return {
        suggestions,
      }
    },
  }
