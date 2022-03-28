import { TREE_LEAF_FIELD } from 'uiSrc/components/virtual-tree'

export const constructKeysToTreeMockResult = [
  {
    name: TREE_LEAF_FIELD,
    children: [],
    keys: {
      keys2: {
        name: 'keys2',
        type: 'hash',
        ttl: -1,
        size: 71
      },
      test1: {
        name: 'test1',
        type: 'hash',
        ttl: -1,
        size: 71
      },
      test2: {
        name: 'test2',
        type: 'hash',
        ttl: -1,
        size: 71
      },
      keys1: {
        name: 'keys1',
        type: 'hash',
        ttl: -1,
        size: 71
      }
    },
    keyCount: 4,
    fullName: `${TREE_LEAF_FIELD}:`,
    keyApproximate: 40,
  },
  {
    name: 'keys',
    children: [
      {
        name: TREE_LEAF_FIELD,
        children: [],
        keys: {
          'keys:1': {
            name: 'keys:1',
            type: 'hash',
            ttl: -1,
            size: 71
          },
          'keys:3': {
            name: 'keys:3',
            type: 'hash',
            ttl: -1,
            size: 71
          },
          'keys:2': {
            name: 'keys:2',
            type: 'hash',
            ttl: -1,
            size: 71
          }
        },
        keyCount: 3,
        fullName: `keys:${TREE_LEAF_FIELD}:`,
        keyApproximate: 30,
      },
      {
        name: '1',
        children: [
          {
            name: TREE_LEAF_FIELD,
            children: [],
            keys: {
              'keys:1:2': {
                name: 'keys:1:2',
                type: 'hash',
                ttl: -1,
                size: 71
              },
              'keys:1:1': {
                name: 'keys:1:1',
                type: 'hash',
                ttl: -1,
                size: 71
              }
            },
            keyCount: 2,
            fullName: `keys:1:${TREE_LEAF_FIELD}:`,
            keyApproximate: 20,
          }
        ],
        keyCount: 2,
        fullName: 'keys:1:',
        keyApproximate: 20,
      }
    ],
    keyCount: 5,
    fullName: 'keys:',
    keyApproximate: 50,
  },
  {
    name: 'empty',
    children: [
      {
        name: '',
        children: [
          {
            name: TREE_LEAF_FIELD,
            children: [],
            keys: {
              'empty::test': {
                name: 'empty::test',
                type: 'hash',
                ttl: -1,
                size: 71
              }
            },
            keyCount: 1,
            fullName: `empty::${TREE_LEAF_FIELD}:`,
            keyApproximate: 10,
          }
        ],
        keyCount: 1,
        fullName: 'empty::',
        keyApproximate: 10,
      }
    ],
    keyCount: 1,
    fullName: 'empty:',
    keyApproximate: 10,
  }
]
