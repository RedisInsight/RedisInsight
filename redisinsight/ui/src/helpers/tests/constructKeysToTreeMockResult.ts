import { getTreeLeafField } from 'uiSrc/components/virtual-tree'
import { DEFAULT_DELIMITER } from 'uiSrc/constants'

export const constructKeysToTreeMockResult = [
  {
    name: getTreeLeafField(DEFAULT_DELIMITER),
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
    fullName: `${getTreeLeafField(DEFAULT_DELIMITER)}:`,
    keyApproximate: 40,
  },
  {
    name: 'keys',
    children: [
      {
        name: getTreeLeafField(DEFAULT_DELIMITER),
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
        fullName: `keys:${getTreeLeafField(DEFAULT_DELIMITER)}:`,
        keyApproximate: 30,
      },
      {
        name: '1',
        children: [
          {
            name: getTreeLeafField(DEFAULT_DELIMITER),
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
            fullName: `keys:1:${getTreeLeafField(DEFAULT_DELIMITER)}:`,
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
            name: getTreeLeafField(DEFAULT_DELIMITER),
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
            fullName: `empty::${getTreeLeafField(DEFAULT_DELIMITER)}:`,
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
