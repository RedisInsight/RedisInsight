import { visit } from 'unist-util-visit'

export enum ButtonLang {
  Redis = 'redis',
  Diff = 'diff'
}

const PARAMS_SEPARATOR = ':'

const processDiffContent = (value: string): string => {
  const lines = value.split('\n')
  const processedLines = lines.map((line: string) => {
    // Handle both "+ content" and "+content" cases
    if (line.startsWith('+ ') || line.startsWith('+')) {
      const content = line.startsWith('+ ') ? line.slice(2) : line.slice(1)
      return `<span class="token prefix inserted">${content}</span>`
    }
    if (line.startsWith('- ') || line.startsWith('-')) {
      const content = line.startsWith('- ') ? line.slice(2) : line.slice(1)
      return `<span class="token prefix deleted">${content}</span>`
    }
    return line
  })
  return processedLines.join('\n')
}

export const remarkCode =
  (codeOptions?: Record<string, any>): ((tree: Node) => void) =>
  (tree: any) => {
    // Find code node in syntax tree
    visit(tree, 'code', (codeNode) => {
      const { value, meta, lang } = codeNode

      if (!lang && !codeOptions?.allLangs) return

      // Handle diff highlighting
      const isDiff = value.split('\n').some((line: string) => line.startsWith('+ ') || line.startsWith('- '))
      const processedValue = isDiff ? processDiffContent(value) : value

      if (codeOptions?.allLangs) {
        codeNode.type = 'html'
        // Use dangerouslySetInnerHTML-style object to prevent escaping
        codeNode.value = `<Code label="${meta || ''}" lang="${lang}"><div dangerouslySetInnerHTML={{__html: \`${processedValue}\`}} /></Code>`
      }

      const isRedisLang = lang?.startsWith(ButtonLang.Redis)
      if (isRedisLang) {
        const [, params] = lang?.split(PARAMS_SEPARATOR) || []

        codeNode.type = 'html'
        // Use dangerouslySetInnerHTML-style object to prevent escaping
        codeNode.value = `<Code label="${meta || ''}" params="${params}" path={path} lang="redis"><div dangerouslySetInnerHTML={{__html: \`${processedValue}\`}} /></Code>`
      }
    })
  }
