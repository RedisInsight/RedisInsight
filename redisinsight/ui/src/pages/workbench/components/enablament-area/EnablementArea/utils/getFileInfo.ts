import { get } from 'lodash'
import { API_URL } from 'uiSrc/constants'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'

export interface IFileInfo {
  extension: string;
  name: string;
  parent: string;
  location: string;
}

export const getFileInfo = (path: string): IFileInfo => {
  const result: IFileInfo = { extension: '', name: '', parent: '', location: '' }
  try {
    const url = IS_ABSOLUTE_PATH.test(path) ? new URL(path) : new URL(path, API_URL)
    const pathNames = url.pathname.split('/')
    const file = pathNames.pop() || ''

    result.location = pathNames.join('/')
    const parent = pathNames.pop() || ''
    const [fileName, extension] = file.split('.')
    if (fileName) {
      result.name = fileName
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

const EA_STATIC_PATH_REGEX = /^\/?static\/(workbench|enablement-area)\//

export const getPagesInsideGroup = (
  structure: Record<string, IEnablementAreaItem>,
  path: string
): IEnablementAreaItem[] => {
  if (!IS_ABSOLUTE_PATH.test(path) && EA_STATIC_PATH_REGEX.test(path)) {
    const groupPath = path.replace(EA_STATIC_PATH_REGEX, '').replace('/', '.children.')
    const groupChildren = get(structure, groupPath, undefined)?.children
    if (groupChildren) {
      return Object.values(groupChildren).filter((item) => item.type === EnablementAreaComponent.InternalLink)
    }
  }
  return []
}
