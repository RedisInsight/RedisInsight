import { DATABASE_LIST_MODULES_TEXT, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import RedisAIDark from 'uiSrc/assets/img/modules/RedisAIDark.svg'
import RedisAILight from 'uiSrc/assets/img/modules/RedisAILight.svg'
import RedisBloomDark from 'uiSrc/assets/img/modules/RedisBloomDark.svg'
import RedisBloomLight from 'uiSrc/assets/img/modules/RedisBloomLight.svg'
import RedisGearsDark from 'uiSrc/assets/img/modules/RedisGearsDark.svg'
import RedisGearsLight from 'uiSrc/assets/img/modules/RedisGearsLight.svg'
import RedisGraphDark from 'uiSrc/assets/img/modules/RedisGraphDark.svg'
import RedisGraphLight from 'uiSrc/assets/img/modules/RedisGraphLight.svg'
import RedisGears2Dark from 'uiSrc/assets/img/modules/RedisGears2Dark.svg'
import RedisGears2Light from 'uiSrc/assets/img/modules/RedisGears2Light.svg'
import RedisJSONDark from 'uiSrc/assets/img/modules/RedisJSONDark.svg'
import RedisJSONLight from 'uiSrc/assets/img/modules/RedisJSONLight.svg'
import RedisTimeSeriesDark from 'uiSrc/assets/img/modules/RedisTimeSeriesDark.svg'
import RedisTimeSeriesLight from 'uiSrc/assets/img/modules/RedisTimeSeriesLight.svg'
import RedisSearchDark from 'uiSrc/assets/img/modules/RedisSearchDark.svg'
import RedisSearchLight from 'uiSrc/assets/img/modules/RedisSearchLight.svg'

const rediSearchIcons = {
  iconDark: RedisSearchDark,
  iconLight: RedisSearchLight,
}

export const DEFAULT_MODULES_INFO = {
  [RedisDefaultModules.AI]: {
    iconDark: RedisAIDark,
    iconLight: RedisAILight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI],
  },
  [RedisDefaultModules.Bloom]: {
    iconDark: RedisBloomDark,
    iconLight: RedisBloomLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  },
  [RedisDefaultModules.Gears]: {
    iconDark: RedisGearsDark,
    iconLight: RedisGearsLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  },
  [RedisDefaultModules.Graph]: {
    iconDark: RedisGraphDark,
    iconLight: RedisGraphLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Graph],
  },
  [RedisDefaultModules.RedisGears]: {
    iconDark: RedisGearsDark,
    iconLight: RedisGearsLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears],
  },
  [RedisDefaultModules.RedisGears2]: {
    iconDark: RedisGears2Dark,
    iconLight: RedisGears2Light,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears2],
  },
  [RedisDefaultModules.ReJSON]: {
    iconDark: RedisJSONDark,
    iconLight: RedisJSONLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.ReJSON],
  },
  [RedisDefaultModules.Search]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search],
  },
  [RedisDefaultModules.SearchLight]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.SearchLight],
  },
  [RedisDefaultModules.FT]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FT],
  },
  [RedisDefaultModules.FTL]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FTL],
  },
  [RedisDefaultModules.TimeSeries]: {
    iconDark: RedisTimeSeriesDark,
    iconLight: RedisTimeSeriesLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  },
}
