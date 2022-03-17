import { DATABASE_LIST_MODULES_TEXT, RedisDefaultModules } from 'uiSrc/slices/interfaces'

export interface IDatabaseModule {
  abbreviation: string
  moduleName: string
  icon?: any
  content?: any,
  [key: string]: any
}

const PREDEFINED_MODULES_ORDER = [
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search],
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.ReJSON],
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI]
]

export const sortModules = (modules: IDatabaseModule[]) => {
  return modules.sort((a, b) => {
    if (!a.moduleName && !a.abbreviation) return 1
    if (!b.moduleName && !b.abbreviation) return -1
    if (PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) === -1) return 1
    if (PREDEFINED_MODULES_ORDER.indexOf(b.moduleName) === -1) return -1
    return PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) - PREDEFINED_MODULES_ORDER.indexOf(b.moduleName)
  })
}
