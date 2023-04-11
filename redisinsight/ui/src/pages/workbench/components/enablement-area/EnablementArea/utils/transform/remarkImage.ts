import { visit } from 'unist-util-visit'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'

export const remarkImage = (path: string): (tree: Node) => void => (tree: any) => {
  // Find img node in syntax tree
  visit(tree, 'image', (node) => {
    const pathURL = new URL(path, RESOURCES_BASE_URL)
    const url = new URL(node.url, pathURL)
    node.url = url.toString()
  })
}
