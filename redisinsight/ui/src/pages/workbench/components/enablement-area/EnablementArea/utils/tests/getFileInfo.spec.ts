import { MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import { getFileInfo, getPagesInsideGroup } from '../getFileInfo'

const getFileInfoTests = [
  {
    input: [{ path: 'static/workbench/quick-guides/file-name.txt' }],
    expected: { name: 'file-name', parent: 'quick guides', extension: 'txt', location: '/static/workbench/quick-guides', _key: null }
  },
  {
    input: [{ path: 'parent_folder\\file_name.txt' }],
    expected: { name: 'file_name', parent: 'parent folder', extension: 'txt', location: '/parent_folder', _key: null }
  },
  {
    input: [{ path: 'https://domen.com/workbench/enablement-area/introduction.html' }],
    expected: { name: 'introduction', parent: 'enablement area', extension: 'html', location: '/workbench/enablement-area', _key: null }
  },
  {
    input: [{ path: 'https://domen.com/introduction.html' }],
    expected: { name: 'introduction', parent: '', extension: 'html', location: '', _key: null }
  },
  {
    input: [{ path: '/introduction.html' }],
    expected: { name: 'introduction', parent: '', extension: 'html', location: '', _key: null }
  },
  {
    input: [{ path: '//parent/markdown.md' }],
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: [{ path: '/file.txt' }],
    expected: { name: 'file', parent: '', extension: 'txt', location: '', _key: null }
  },
  {
    input: [{ path: '' }],
    expected: { name: '', parent: '', extension: '', location: '', _key: null }
  },
  {
    input: [{ path: '/' }],
    expected: { name: '', parent: '', extension: '', location: '', _key: null }
  },
  {
    input: [{ manifestPath: 'quick-guides/0/0', path: '/static/workbench/quick-guides/document/learn-more.md' }, MOCK_GUIDES_ITEMS],
    expected: { name: 'learn-more', parent: MOCK_GUIDES_ITEMS[0].label, extension: 'md', location: '/static/workbench/quick-guides/document', _key: '0' }
  }
]

describe('getFileInfo', () => {
  test.each(getFileInfoTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getFileInfo(...input)
      expect(result).toEqual(expected)
    }
  )
})

const getPagesInsideGroupTests = [
  {
    input: [MOCK_GUIDES_ITEMS, 'quick-guides/0/0'],
    expected: (MOCK_GUIDES_ITEMS[0].children || []).map((item, index) => ({
      ...item,
      _groupPath: 'quick-guides/0',
      _key: `${index}`
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
