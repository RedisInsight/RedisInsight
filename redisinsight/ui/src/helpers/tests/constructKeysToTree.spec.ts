import { constructKeysToTree } from '../constructKeysToTree'
import { constructKeysToTreeMockResult } from './constructKeysToTreeMockResult'

const constructKeysToTreeTests: any[] = [
  [{
    items: [
      { name: 'keys:1:2', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys2', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys:1:1', type: 'hash', ttl: -1, size: 71 },
      { name: 'empty::test', type: 'hash', ttl: -1, size: 71 },
      { name: 'test1', type: 'hash', ttl: -1, size: 71 },
      { name: 'test2', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys:1', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys1', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys:3', type: 'hash', ttl: -1, size: 71 },
      { name: 'keys:2', type: 'hash', ttl: -1, size: 71 },
    ],
    separator: ':' },
  constructKeysToTreeMockResult
  ]
]

const removeIds = (nodes: any[]) => nodes.map(({ children, id, ...rest }) => ({
  ...rest,
  children: removeIds(children)
}))

describe('constructKeysToTree', () => {
  it.each(constructKeysToTreeTests)('for input: %s (items), should be output: %s',
    (items, expected) => {
      const result = constructKeysToTree(items)
      expect(removeIds(result)).toEqual(expected)
    })
})
