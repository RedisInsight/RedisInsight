import { visit } from 'unist-util-visit'
import { prepareTutorialDataFileUrlFromMd } from 'uiSrc/utils/pathUtil'

export const remarkImage = (path: string): (tree: Node) => void => (tree: any) => {
  // Find img node in syntax tree
  visit(tree, 'image', (node) => {
    node.url = prepareTutorialDataFileUrlFromMd(node.url, path)
  })
}
