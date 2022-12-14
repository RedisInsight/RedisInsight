import { findTreeNode, getTreeLeafField } from 'uiSrc/utils'
import nodes from './nodes.json'

const getTreeLeafFieldTests: any[] = [
  [':', 'keys:keys'],
  [';', 'keys;keys'],
  ['123', 'keys123keys'],
  ['   ', 'keys   keys'],
  ['_', 'keys_keys'],
  ['abc', 'keysabckeys'],
  ['$$$', 'keys$$$keys'],
  ['-', 'keys-keys'],
]

describe('getTreeLeafField', () => {
  it.each(getTreeLeafFieldTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getTreeLeafField(reply)
      expect(result).toBe(expected)
    })
})

const findTreeNodeTests: any[] = [
  ['hash2:keys:keys:', 'id', null],
  ['hash2:keys:keys:', 'fullName', nodes[1]?.children[0]],
  ['hash:string:', 'fullName', nodes[0]?.children[1]],
  ['hash:string:keys:keys:', 'fullName', nodes[0]?.children[1]?.children[0]],
  ['0.g9y9ox4nau', 'id', nodes[0]?.children[0]],
  ['hash2:keys:keys:', 'id', null],
  ['uoeuoeuoe', 'id', null],
  ['uoeuoeuoe', 'fullName', null],
  ['hash2:', 'fullName', nodes[1]],
]

describe('findTreeNode', () => {
  it.each(findTreeNodeTests)('for input: %s (reply), should be output: %s',
    (reply, key, expected) => {
      const result = findTreeNode(nodes, reply, key)
      expect(result).toBe(expected)
    })
})
