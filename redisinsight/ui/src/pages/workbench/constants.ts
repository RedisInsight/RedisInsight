import RSNotAvailableLightImg from 'uiSrc/assets/img/workbench/RediSearchNotAvailableLight.jpg'
import RSNotAvailableDarkImg from 'uiSrc/assets/img/workbench/RediSearchNotAvailableDark.jpg'
import TextViewIconDark from 'uiSrc/assets/img/workbench/text_view_dark.svg'
import TextViewIconLight from 'uiSrc/assets/img/workbench/text_view_light.svg'
import { IModuleNotLoadedContent } from './components/module-not-loaded'

export const WORKBENCH_HISTORY_WRAPPER_NAME = 'WORKBENCH'
export const WORKBENCH_HISTORY_MAX_LENGTH = 30

export enum WBQueryType {
  Text = 'Text',
  Plugin = 'Plugin'
}

export const VIEW_TYPE_OPTIONS = [
  {
    id: 'default__Text',
    text: 'Text',
    name: 'default__Text',
    value: WBQueryType.Text,
    iconDark: TextViewIconDark,
    iconLight: TextViewIconLight,
    internal: true,
  },
]

export const getViewTypeOptions = () =>
  [...VIEW_TYPE_OPTIONS]

export const SEARCH_COMMANDS = ['ft.search', 'ft.aggregate']
export const GRAPH_COMMANDS = ['graph.query']

const ALLOWED_PROFILE_COMMANDS = [...SEARCH_COMMANDS, ...GRAPH_COMMANDS]

export const isCommandAllowedForProfile = (query: string) => ALLOWED_PROFILE_COMMANDS.includes(query?.split(' ')?.[0]?.toLowerCase())

export enum ProfileQueryType {
  Profile = 'Profile',
  Explain = 'Explain'
}

const PROFILE_VIEW_TYPE_OPTIONS = [
  {
    id: ProfileQueryType.Profile,
    text: 'Profile the command',
    name: 'Profile',
    value: WBQueryType.Text,
  },
  {
    id: ProfileQueryType.Explain,
    text: 'Explain the command',
    name: 'Explain',
    value: WBQueryType.Text,
  },
]

export const getProfileViewTypeOptions = () =>
  [...PROFILE_VIEW_TYPE_OPTIONS]


export enum ModuleCommandPrefix {
  RediSearch = 'FT.',
}

export const RSNotLoadedContent: IModuleNotLoadedContent = {
  output: 'RediSearch module is not loaded for this database',
  createCloudBtnText: 'Create your free Redis database with RediSearch on Redis Cloud​',
  createCloudBtnHref: 'https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisearch_offer_jan',
  summaryText: 'RedisInsight supports RediSearch and allows you to:<br/><br/>'
    + '<ul><li>Build and execute queries</li><li>Browse, analyse and export results</li></ul></br>'
    + 'As a benefit you get faster turnarounds when building your application using Redis and RediSearch.',
  summaryImgDark: RSNotAvailableDarkImg,
  summaryImgLight: RSNotAvailableLightImg,
  // summaryImgPath: 'uiSrc/assets/img/workbench/RediSearchNotAvailable.jpg',
  columns: [{
    title: 'What is RediSearch?',
    text: 'RediSearch is a real-time search engine that enables you to query your Redis data. It implements a secondary index on top of Redis.<br/>This enables advanced features, such as multi-field queries, aggregation, auto-completion and full text search capabilities.<br/>These capabilities include exact phrase matching, fuzzy and prefix matching, numeric filtering, geo-spatial filtering, something that is neither possible or efficient with traditional Redis indexing approaches.',
  }, {
    title: 'Learn more about RediSearch module:',
    text: '<a href="https://oss.redis.com/redisearch/" target="_blank">RediSearch Quick Start tutorial</a>'
      + '<a href="https://docs.redis.com/latest/modules/redisearch/" target="_blank">RediSearch Documentation</a>'
      + '<a href="https://oss.redis.com/redisearch/Commands/" target="_blank">RediSearch Commands</a>'
      + '<a href="https://redis.com/modules/redis-search/" target="_blank">RediSearch in Brief</a>'
      + '<a href="https://redis.com/blog/search-benchmarking-redisearch-vs-elasticsearch/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisearch" target="_blank">RediSearch Benchmarks (blog post)</a>'
  }]
}
