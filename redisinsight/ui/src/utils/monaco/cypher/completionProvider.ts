import { monaco as monacoEditor } from 'react-monaco-editor'
import { FUNCTIONS, KEYWORDS } from 'uiSrc/constants/monaco/cypher/monacoCypher'

export const getCypherCompletionProvider = (): monacoEditor.languages.CompletionItemProvider => ({
  provideCompletionItems: (
    model: monacoEditor.editor.IModel,
    position: monacoEditor.Position
  ): monacoEditor.languages.CompletionList => {
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      endColumn: word.endColumn,
      startColumn: word.startColumn
    }

    // display suggestions only for words that don't belong to a folding area
    if (!model.getValueInRange(range).startsWith(' ')) {
      const keywordsSuggestions = KEYWORDS.map((item: string) => (
        {
          label: item,
          kind: monacoEditor.languages.CompletionItemKind.Keyword,
          insertText: item,
          range,
          sortText: `a${item}`,
        }
      ))

      const functionsSuggestions = FUNCTIONS.map((item: any) => (
        {
          label: item.name,
          detail: item.signature,
          kind: monacoEditor.languages.CompletionItemKind.Function,
          documentation: item.description,
          insertText: item.name,
          range,
          sortText: `b${item.name}`,
          insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
      ))

      return {
        suggestions: [...keywordsSuggestions, ...functionsSuggestions]
      }
    }
    return { suggestions: [] }
  }
})
