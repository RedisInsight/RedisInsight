import { visit } from 'unist-util-visit'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'

export const remarkImage = (): (tree: Node) => void => (tree: any) => {
  // Find img node in syntax tree
  visit(tree, 'image', (node) => {
    node.url = IS_ABSOLUTE_PATH.test(node.url || '') ? node.url : `${RESOURCES_BASE_URL}${node.url.replace(/^\//, '')}`
  })
}
