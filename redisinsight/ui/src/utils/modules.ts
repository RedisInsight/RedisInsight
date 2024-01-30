import { find, some } from 'lodash'
import {
  DATABASE_LIST_MODULES_TEXT,
  Instance,
  RedisDefaultModules,
  REDISEARCH_MODULES,
  TRIGGERED_AND_FUNCTIONS_MODULES
} from 'uiSrc/slices/interfaces'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

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
const PREDEFINED_MODULES_ORDER = PREDEFINED_MODULE_NAMES_ORDER.map((module) => DATABASE_LIST_MODULES_TEXT[module])

export const sortModules = (modules: IDatabaseModule[] = []) => modules.sort((a, b) => {
  if (!a.moduleName && !a.abbreviation) return 1
  if (!b.moduleName && !b.abbreviation) return -1
  if (PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) === -1) return 1
  if (PREDEFINED_MODULES_ORDER.indexOf(b.moduleName) === -1) return -1
  return PREDEFINED_MODULES_ORDER.indexOf(a.moduleName) - PREDEFINED_MODULES_ORDER.indexOf(b.moduleName)
})

export const sortModulesByName = (modules: AdditionalRedisModule[] = []) => [...modules].sort((a, b) => {
  if (PREDEFINED_MODULE_NAMES_ORDER.indexOf(a.name) === -1) return 1
  if (PREDEFINED_MODULE_NAMES_ORDER.indexOf(b.name) === -1) return -1
  return PREDEFINED_MODULE_NAMES_ORDER.indexOf(a.name) - PREDEFINED_MODULE_NAMES_ORDER.indexOf(b.name)
})

export const isRedisearchModule = (moduleName: string) =>
  REDISEARCH_MODULES.some((value) => moduleName === value)
export const isRedisearchAvailable = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some(({ name }) => isRedisearchModule(name))

export const isTriggeredAndFunctionsModule = (moduleName: string) =>
  TRIGGERED_AND_FUNCTIONS_MODULES.some((value) => moduleName === value)

export const isTriggeredAndFunctionsAvailable = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some(({ name }) => isTriggeredAndFunctionsModule(name))

export const isContainJSONModule = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some((m: AdditionalRedisModule) => m.name === RedisDefaultModules.ReJSON)

export const getDbWithModuleLoaded = (databases: Instance[], moduleName: string) =>
  find(databases, ({ modules }) => {
    if (isTriggeredAndFunctionsModule(moduleName)) return isTriggeredAndFunctionsAvailable(modules)
    if (isRedisearchModule(moduleName)) return isRedisearchAvailable(modules)

    return some(modules, ({ name }) => name === moduleName)
  })
