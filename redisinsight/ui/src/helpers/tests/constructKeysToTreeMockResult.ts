export const delimiterMock = ':|_'
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
            fullName: `empty${delimiterMock + delimiterMock}empty::testkeys${delimiterMock}keys${delimiterMock}`,
          }
        ],
        keyCount: 1,
        keyApproximate: 10,
        path: '0.0',
        fullName: `empty${delimiterMock + delimiterMock}`,
      }
    ],
    keyCount: 1,
    keyApproximate: 10,
    path: '0',
    fullName: `empty${delimiterMock}`,
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
            fullName: `keys${delimiterMock}1${delimiterMock}keys:1:1keys${delimiterMock}keys${delimiterMock}`,
          },
          {
            nameString: 'keys:1:2',
            isLeaf: true,
            children: [],
            path: '1.0.1',
            fullName: `keys${delimiterMock}1${delimiterMock}keys:1:2keys${delimiterMock}keys${delimiterMock}`,
          }
        ],
        keyCount: 2,
        keyApproximate: 20,
        path: '1.0',
        fullName: `keys${delimiterMock}1${delimiterMock}`,
      },
      {
        nameString: 'keys_2',
        isLeaf: true,
        children: [],
        path: '1.1',
        fullName: `keys${delimiterMock}keys_2keys${delimiterMock}keys${delimiterMock}`,
      },
      {
        nameString: 'keys:1',
        isLeaf: true,
        children: [],
        path: '1.2',
        fullName: `keys${delimiterMock}keys:1keys${delimiterMock}keys${delimiterMock}`,
      },
      {
        nameString: 'keys:2',
        isLeaf: true,
        children: [],
        path: '1.3',
        fullName: `keys${delimiterMock}keys:2keys${delimiterMock}keys${delimiterMock}`,
      },
      {
        nameString: 'keys:3',
        isLeaf: true,
        children: [],
        path: '1.4',
        fullName: `keys${delimiterMock}keys:3keys${delimiterMock}keys${delimiterMock}`,
      }
    ],
    keyCount: 6,
    keyApproximate: 60,
    path: '1',
    fullName: `keys${delimiterMock}`,
  },
  {
    nameString: 'keys1',
    isLeaf: true,
    children: [],
    path: '2',
    fullName: `keys1keys${delimiterMock}keys${delimiterMock}`,
  },
  {
    nameString: 'test1',
    isLeaf: true,
    children: [],
    path: '3',
    fullName: `test1keys${delimiterMock}keys${delimiterMock}`,
  },
  {
    nameString: 'test2',
    isLeaf: true,
    children: [],
    path: '4',
    fullName: `test2keys${delimiterMock}keys${delimiterMock}`,
  }
]
