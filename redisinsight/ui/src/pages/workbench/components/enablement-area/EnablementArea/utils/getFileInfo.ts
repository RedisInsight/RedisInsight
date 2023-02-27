import { forEach, get } from 'lodash'
import { API_URL, ApiEndpoints } from 'uiSrc/constants'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

export interface IFileInfo {
  extension: string
  name: string
  parent: string
  location: string
}

export const getFileInfo = (
  { manifestPath, path }: { manifestPath?: Nullable<string>, path: string },
  manifest?: Nullable<Record<string, IEnablementAreaItem>>
): IFileInfo => {
  const defaultResult: IFileInfo = { extension: '', name: '', parent: '', location: '' }
  try {
    const url = IS_ABSOLUTE_PATH.test(path) ? new URL(path) : new URL(path, API_URL)
    const pathNames = url.pathname.split('/')
    const file = pathNames.pop() || ''
    const markdownParent = manifest ? getParentByManifest(manifest, manifestPath) : null
    const [fileName, extension] = file.split('.')

    return {
      location: pathNames.join('/'),
      name: fileName || '',
      extension: extension || '',
      parent: markdownParent ? markdownParent.label : (pathNames.pop() || '').replace(/[-_]+/g, ' ')
    } as IFileInfo
  } catch (e) {
    return defaultResult
  }
}

export const getPagesInsideGroup = (
  structure: Record<string, IEnablementAreaItem>,
  manifestPath: Nullable<string> = ''
): IEnablementAreaItem[] => {
  try {
    if (!manifestPath) return []
    const groupPath = getGroupPath(manifestPath)
    const groupChildren = getParentByManifest(structure, manifestPath)?.children

    if (groupChildren) {
      return Object.keys(groupChildren)
        .map((key) => ({ ...groupChildren[key], _key: key }))
        .filter((item) => item.type === EnablementAreaComponent.InternalLink)
        .map((item) => ({ ...item, _groupPath: groupPath }))
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
  if (path.includes(ApiEndpoints.CUSTOM_TUTORIALS_PATH)) {
    return ApiEndpoints.CUSTOM_TUTORIALS_PATH
  }
  return ''
}

export const getMarkPathDownByManifest = (
  manifest: Record<string, IEnablementAreaItem>,
  manifestPath: Nullable<string> = '',
  pathPrefix: string = ''
) => {
  if (!manifestPath) return pathPrefix

  const path = manifestPath.replace(/^\//, '')
  const pathToMarkDown = path.replaceAll('/', '.children.')
  const markDownPath = get(manifest, pathToMarkDown)?.args?.path

  if (!markDownPath) return pathPrefix

  let currentObject = manifest
  let folderPath = ''

  forEach(path.split('/'), (key) => {
    const structureObject = currentObject[key]
    if (!structureObject) return false

    folderPath += (currentObject[key]._path || '')

    if (!structureObject.children) return false

    currentObject = structureObject.children
    return undefined
  })

  return pathPrefix + folderPath + markDownPath
}

const getGroupPath = (manifestPath: Nullable<string> = '') => manifestPath?.replace(/^\//, '').split('/').slice(0, -1).join('/')

const getParentByManifest = (
  manifest: Record<string, IEnablementAreaItem>,
  manifestPath: Nullable<string> = ''
) => {
  if (!manifestPath) return null

  const groupPath = getGroupPath(manifestPath)
  const groupObjectPath = groupPath?.replaceAll('/', '.children.') || ''
  const parent = get(manifest, groupObjectPath)

  return parent ?? null
}
