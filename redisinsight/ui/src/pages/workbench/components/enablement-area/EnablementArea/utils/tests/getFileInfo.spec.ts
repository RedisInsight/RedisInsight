import { MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { getFileInfo, getPagesInsideGroup } from '../getFileInfo'

const getFileInfoTests = [
  {
    input: { path: 'static/workbench/quick-guides/file-name.txt' },
    expected: { name: 'file-name', parent: 'quick guides', extension: 'txt', location: '/static/workbench/quick-guides' }
  },
  {
    input: { path: 'parent_folder\\file_name.txt' },
    expected: { name: 'file_name', parent: 'parent folder', extension: 'txt', location: '/parent_folder' }
  },
  {
    input: { path: 'https://domen.com/workbench/enablement-area/introduction.html' },
    expected: { name: 'introduction', parent: 'enablement area', extension: 'html', location: '/workbench/enablement-area' }
  },
  {
    input: { path: 'https://domen.com/introduction.html' },
    expected: { name: 'introduction', parent: '', extension: 'html', location: '' }
  },
  {
    input: { path: '/introduction.html' },
    expected: { name: 'introduction', parent: '', extension: 'html', location: '' }
  },
  {
    input: { path: '//parent/markdown.md' },
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: { path: '/file.txt' },
    expected: { name: 'file', parent: '', extension: 'txt', location: '' }
  },
  {
    input: { path: '' },
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: { path: '/' },
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
    input: [MOCK_GUIDES_ITEMS, '/quick-guides/document-capabilities'],
    expected: Object.values(MOCK_GUIDES_ITEMS['quick-guides'].children || {}).map((item) => ({
      ...item,
      _groupPath: 'quick-guides',
      _key: expect.any(String)
    }))
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
