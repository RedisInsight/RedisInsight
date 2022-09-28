import { MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { getFileInfo, getPagesInsideGroup } from '../getFileInfo'

const getFileInfoTests = [
  {
    input: 'static/workbench/quick-guides/file-name.txt',
    expected: { name: 'file-name', parent: 'quick guides', extension: 'txt', location: '/static/workbench/quick-guides' }
  },
  {
    input: 'parent_folder\\file_name.txt',
    expected: { name: 'file_name', parent: 'parent folder', extension: 'txt', location: '/parent_folder' }
  },
  {
    input: 'https://domen.com/workbench/enablement-area/introduction.html',
    expected: { name: 'introduction', parent: 'enablement area', extension: 'html', location: '/workbench/enablement-area' }
  },
  {
    input: 'https://domen.com/introduction.html',
    expected: { name: 'introduction', parent: '', extension: 'html', location: '' }
  },
  {
    input: '/introduction.html',
    expected: { name: 'introduction', parent: '', extension: 'html', location: '' }
  },
  {
    input: '//parent/markdown.md',
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: '/file.txt',
    expected: { name: 'file', parent: '', extension: 'txt', location: '' }
  },
  {
    input: '',
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: '/',
    expected: { name: '', parent: '', extension: '', location: '' }
  },
]

describe('getFileInfo', () => {
  test.each(getFileInfoTests)(
    '%j',
    ({ input, expected }) => {
      const result = getFileInfo(input)
      expect(result).toEqual(expected)
    }
  )
})

const getPagesInsideGroupTests = [
  {
    input: [MOCK_GUIDES_ITEMS, '/static/guides/quick-guides'],
    expected: Object.values(MOCK_GUIDES_ITEMS['quick-guides'].children || {})
  },
  {
    input: [MOCK_GUIDES_ITEMS, '/static/workbench/'],
    expected: [MOCK_GUIDES_ITEMS['internal-page'], MOCK_GUIDES_ITEMS['second-internal-page']]
  },
  {
    input: [MOCK_GUIDES_ITEMS, 'https://domen.com/workbench/enablement-area/'],
    expected: []
  },
  {
    input: [],
    expected: []
  },
]

describe('getPagesInsideGroup', () => {
  test.each(getPagesInsideGroupTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getPagesInsideGroup(...input)
      expect(result).toEqual(expected)
    }
  )
})
