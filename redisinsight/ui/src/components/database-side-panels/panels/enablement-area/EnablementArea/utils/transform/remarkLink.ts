import { visit } from 'unist-util-visit'

export const remarkLink = (): (tree: Node) => void => (tree: any) => {
  // Find link node in syntax tree
  visit(tree, 'link', (node) => {
    if (node.title === 'Redis Cloud') {
      const [text] = node.children || []
      node.type = 'html'
      node.value = `<CloudLink url="${node.url}" text="${text?.value || 'Redis Cloud'}" />`
    }

    if (node.url?.toLowerCase()?.startsWith('redisinsight')) {
      const [text] = node.children || []
      const url = node.url.replace('redisinsight:', '')
      node.type = 'html'
      node.value = `<RedisInsightLink url="${url}" text="${text?.value || 'Redis Cloud'}" />`
    }
  })
}
