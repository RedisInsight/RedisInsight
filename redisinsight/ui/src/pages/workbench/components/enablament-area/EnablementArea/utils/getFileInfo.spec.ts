import { getFileInfo } from './getFileInfo'

const getFileInfoTests = [
  {
    input: '/parent-folder/file-name.txt',
    expected: { title: 'file name', parent: 'parent folder', extension: 'txt' }
  },
  {
    input: 'parent_folder\\file_name.txt',
    expected: { title: 'file name', parent: 'parent folder', extension: 'txt' }
  },
  {
    input: 'https://domen.com/workbench/enablement-area/introduction.html',
    expected: { title: 'introduction', parent: 'enablement area', extension: 'html' }
  },
  {
    input: 'https://domen.com/introduction.html',
    expected: { title: 'introduction', parent: '', extension: 'html' }
  },
  {
    input: '/introduction.html',
    expected: { title: 'introduction', parent: '', extension: 'html' }
  },
  {
    input: '//parent/markdown.md',
    expected: { title: '', parent: '', extension: '' }
  },
  {
    input: '/file.txt',
    expected: { title: 'file', parent: '', extension: 'txt' }
  },
  {
    input: '',
    expected: { title: '', parent: '', extension: '' }
  },
  {
    input: '/',
    expected: { title: '', parent: '', extension: '' }
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
