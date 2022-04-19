import { get } from 'lodash'
import { API_URL, ApiEndpoints } from 'uiSrc/constants'
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

const EA_STATIC_PATH_REGEX = /^\/?static\/(workbench|guides|tutorials)\//
const EA_STATIC_ROOT_PATH = /^\/?static\/(workbench|guides|tutorials)\/?$/
const EA_GUIDES_PATH = '/static/guides/'
const EA_TUTORIALS_PATH = '/static/'

export const getPagesInsideGroup = (
  structure: Record<string, IEnablementAreaItem>,
  path: string
): IEnablementAreaItem[] => {
  try {
    if (EA_STATIC_PATH_REGEX.test(path)) {
      let groupPath = path.replace(EA_GUIDES_PATH, '').replace(EA_TUTORIALS_PATH, '')
      let groupChildren
      if (!EA_STATIC_ROOT_PATH.test(path)) {
        groupPath = groupPath.replace('/', '.children.')
        // groupPath = 'tutorials.children.redis_stack'
        groupChildren = get(structure, groupPath, undefined)?.children
      } else {
        groupChildren = structure
      }
      if (groupChildren) {
        return Object.values(groupChildren)
          .filter((item) => item.type === EnablementAreaComponent.InternalLink)
      }
    }
    return []
  } catch (e) {
    return []
  }
}

export const getWBSourcePath = (path: string): string => {
  if (path.includes(ApiEndpoints.TUTORIALS_PATH)) {
    return ApiEndpoints.TUTORIALS_PATH
  }
  if (path.includes(ApiEndpoints.GUIDES_PATH)) {
    return ApiEndpoints.GUIDES_PATH
  }
  return ''
}
