import { find } from 'lodash'
import modulesInit from 'uiSrc/constants/allRedisModules.json'
import { DATABASE_LIST_MODULES_TEXT } from 'uiSrc/slices/interfaces'

const getGenericModuleName = (name = '') =>
  (DATABASE_LIST_MODULES_TEXT[name] ?? name)
    ?.toLowerCase?.()
    .replaceAll?.(/[-_]/gi, '')

export const getModule = (propName = ''): any =>
  find(
    modulesInit,
    ({ name }) => getGenericModuleName(name) === getGenericModuleName(propName),
  ) ?? {}
