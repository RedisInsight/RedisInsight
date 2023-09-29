import { visit } from 'unist-util-visit'

export const remarkLink = (): (tree: Node) => void => (tree: any) => {
  // Find link node in syntax tree
  visit(tree, 'link', (node) => {
    if (node.title === 'Redis Cloud') {
      const [text] = node.children || []
      node.type = 'html'
      node.value = `<CloudLink url="${node.url}" text="${text?.value || 'Redis Cloud'}" />`
    }
  })
}
