import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

export const MODULE_CAPABILITY_TEXT_NOT_AVAILABLE: { [key in RedisDefaultModules]?: {
  title: string
  text: string
} } = {
  [RedisDefaultModules.Bloom]: {
    title: 'Probabilistic data structures are not available',
    text: 'Create a free trial Redis Stack database with probabilistic data structures that extend the core capabilities of your Redis.'
  },
  [RedisDefaultModules.ReJSON]: {
    title: 'JSON data structure is not available',
    text: 'Create a free trial Redis Stack database with JSON capability that extends the core capabilities of your Redis.'
  },
  [RedisDefaultModules.Search]: {
    title: 'Redis Query Engine capability is not available',
    text: 'Create a free trial Redis Stack database with search and query features that extend the core capabilities of your Redis.'
  },
  [RedisDefaultModules.TimeSeries]: {
    title: 'Time series data structure is not available',
    text: 'Create a free trial Redis Stack database with the time series data structure that extends the core capabilities of your Redis.'
  },
}
