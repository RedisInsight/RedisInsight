import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import {
  REDISEARCH_GEOSHAPE_SEMANTIC_VERSION,
  REDISEARCH_SEMANTIC_VERSION,
} from 'uiSrc/constants'
import { FIELD_TYPE_OPTIONS, FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

const isGeoshapeOptionAvailable = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some(({ name, semanticVersion, version }) =>
    REDISEARCH_MODULES
      .some((search) => (
        name === search && (
          isVersionHigherOrEquals(semanticVersion, REDISEARCH_GEOSHAPE_SEMANTIC_VERSION)
          || (version && version >= REDISEARCH_SEMANTIC_VERSION)
        ))))

export const getFieldTypeOptions = (modules: AdditionalRedisModule[] = []) => FIELD_TYPE_OPTIONS
  .filter((option) => option.value !== FieldTypes.GEOSHAPE || isGeoshapeOptionAvailable(modules))
  .map(({ value, text }) => ({
    value,
    inputDisplay: text,
  }))
