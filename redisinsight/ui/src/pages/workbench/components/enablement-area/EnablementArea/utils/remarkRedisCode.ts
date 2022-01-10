import { visit } from 'unist-util-visit'

export const remarkRedisCode = (): (tree: Node) => void => (tree: any) => {
  // Find code node in syntax tree
  visit(tree, 'code', (codeNode) => {
    const { value, meta, lang } = codeNode
    // Check that it has a language unsupported by our editor
    if (lang === 'redis') {
      codeNode.type = 'html'
      // Replace it with our custom component
      codeNode.value = `<Code label="${meta}" >{${JSON.stringify(value)}}</Code>`
    }
  })
}
