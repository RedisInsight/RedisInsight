export const constructKeysToTreeMockResult = [
  {
    nameString: 'empty',
    children: [
      {
        nameString: '',
        children: [
          {
            nameString: 'empty::test',
            isLeaf: true,
            children: [],
            path: '0.0.0',
            fullName: 'empty::empty::testkeys:keys:',
          }
        ],
        keyCount: 1,
        keyApproximate: 10,
        path: '0.0',
        fullName: 'empty::',
      }
    ],
    keyCount: 1,
    keyApproximate: 10,
    path: '0',
    fullName: 'empty:',
  },
  {
    nameString: 'keys',
    children: [
      {
        nameString: '1',
        children: [
          {
            nameString: 'keys:1:1',
            isLeaf: true,
            children: [],
            path: '1.0.0',
            fullName: 'keys:1:keys:1:1keys:keys:',
          },
          {
            nameString: 'keys:1:2',
            isLeaf: true,
            children: [],
            path: '1.0.1',
            fullName: 'keys:1:keys:1:2keys:keys:',
          }
        ],
        keyCount: 2,
        keyApproximate: 20,
        path: '1.0',
        fullName: 'keys:1:',
      },
      {
        nameString: 'keys:1',
        isLeaf: true,
        children: [],
        path: '1.1',
        fullName: 'keys:keys:1keys:keys:',
      },
      {
        nameString: 'keys:2',
        isLeaf: true,
        children: [],
        path: '1.2',
        fullName: 'keys:keys:2keys:keys:',
      },
      {
        nameString: 'keys:3',
        isLeaf: true,
        children: [],
        path: '1.3',
        fullName: 'keys:keys:3keys:keys:',
      }
    ],
    keyCount: 5,
    keyApproximate: 50,
    path: '1',
    fullName: 'keys:',
  },
  {
    nameString: 'keys1',
    isLeaf: true,
    children: [],
    path: '2',
    fullName: 'keys1keys:keys:',
  },
  {
    nameString: 'keys2',
    isLeaf: true,
    children: [],
    path: '3',
    fullName: 'keys2keys:keys:',
  },
  {
    nameString: 'test1',
    isLeaf: true,
    children: [],
    path: '4',
    fullName: 'test1keys:keys:',
  },
  {
    nameString: 'test2',
    isLeaf: true,
    children: [],
    path: '5',
    fullName: 'test2keys:keys:',
  }
]
