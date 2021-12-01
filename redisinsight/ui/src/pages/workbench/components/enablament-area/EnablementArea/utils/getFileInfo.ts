import { API_URL } from 'uiSrc/constants'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

interface IFileInfo {
  extension: string;
  title: string;
  parent: string;
}

export const getFileInfo = (path: string): IFileInfo => {
  const result = { extension: '', title: '', parent: '' }
  try {
    const url = IS_ABSOLUTE_PATH.test(path) ? new URL(path) : new URL(path, API_URL)
    const pathNames = url.pathname.split('/')
    const file = pathNames.pop() || ''
    const [fileName, extension] = file.split('.')
    const parent = pathNames.pop() || ''
    if (fileName) {
      result.title = fileName.replace(/[-_]+/g, ' ')
    }
    if (extension) {
      result.extension = extension
    }
    if (parent) {
      result.parent = parent.replace(/[-_]+/g, ' ')
    }
    return result
  } catch (e) {
    return result
  }
}
