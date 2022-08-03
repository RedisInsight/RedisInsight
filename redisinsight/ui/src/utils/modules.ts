import { DATABASE_LIST_MODULES_TEXT, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'

export interface IDatabaseModule {
  abbreviation: string
  moduleName: string
  icon?: any
  content?: any,
  [key: string]: any
}

const PREDEFINED_MODULE_NAMES_ORDER: string[] = [
  RedisDefaultModules.Search,
  RedisDefaultModules.SearchLight,
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Graph,
  RedisDefaultModules.TimeSeries,
  RedisDefaultModules.Bloom,
  RedisDefaultModules.Gears,
  RedisDefaultModules.AI
]

// @ts-ignore
const PREDEFINED_MODULES_ORDER = PREDEFINED_MODULE_NAMES_ORDER.map(module => DATABASE_LIST_MODULES_TEXT[module])

export const sortModules = (modules: IDatabaseModule[]) => {
  return modules.sort((a, b) => {
    if (!a.moduleName && !a.abbreviation) return 1
    if (!b.moduleName && !b.abbreviation) return -1
    if (PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) === -1) return 1
    if (PREDEFINED_MODULES_ORDER.indexOf(b.moduleName) === -1) return -1
    return PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) - PREDEFINED_MODULES_ORDER.indexOf(b.moduleName)
  })
}

export const sortModulesByName = (modules: RedisModuleDto[]) => {
  return [...modules].sort((a, b) => {
    if (PREDEFINED_MODULE_NAMES_ORDER.indexOf(a.name) === -1) return 1
    if (PREDEFINED_MODULE_NAMES_ORDER.indexOf(b.name) === -1) return -1
    return PREDEFINED_MODULE_NAMES_ORDER.indexOf(a.name) - PREDEFINED_MODULE_NAMES_ORDER.indexOf(b.name)
  })
}
