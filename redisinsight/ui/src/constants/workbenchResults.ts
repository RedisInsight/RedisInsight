import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

export const bulkReplyCommands = ['LOLWUT', 'INFO', 'CLIENT', 'CLUSTER', 'MEMORY', 'MONITOR', 'PSUBSCRIBE']

export const EMPTY_COMMAND = 'Encrypted data'

export const MODULE_NOT_LOADED_CONTENT: { [key in RedisDefaultModules]?: any } = {
  [RedisDefaultModules.TimeSeries]: {
    text: ['RedisTimeSeries adds a Time Series data structure to Redis. ', 'With this capability you can:'],
    improvements: [
      'Add sample data',
      'Perform cross-time-series range and aggregation queries',
      'Define compaction rules for economical retention of historical data'
    ],
    link: 'https://redis.io/docs/stack/timeseries/'
  },
  [RedisDefaultModules.Search]: {
    text: ['RediSearch adds the capability to:'],
    improvements: [
      'Query',
      'Secondary index',
      'Full-text search'
    ],
    additionalText: ['These features enable multi-field queries, aggregation, exact phrase matching, numeric filtering, ', 'geo filtering and vector similarity semantic search on top of text queries.'],
    link: 'https://redis.io/docs/stack/search/'
  },
  [RedisDefaultModules.ReJSON]: {
    text: ['RedisJSON adds the capability to:'],
    improvements: [
      'Store JSON documents',
      'Update JSON documents',
      'Retrieve JSON documents'
    ],
    additionalText: ['RedisJSON also works seamlessly with RediSearch to let you index and query JSON documents.'],
    link: 'https://redis.io/docs/stack/json/'
  },
  [RedisDefaultModules.Bloom]: {
    text: ['RedisBloom adds a set of probabilistic data structures to Redis, including:'],
    improvements: [
      'Bloom filter',
      'Cuckoo filter',
      'Count-min sketch',
      'Top-K',
      'T-digest'
    ],
    additionalText: ['With this capability you can query streaming data without needing to store all the elements of the stream.'],
    link: 'https://redis.io/docs/stack/bloom/'
  },
  [RedisDefaultModules.RedisGears]: {
    text: ['Triggers and functions add the capability to execute server-side functions that are triggered by events or data operations to:'],
    improvements: [
      'Speed up applications by running the application logic where the data lives',
      'Eliminate the need to maintain the same code across different applications by moving application functionality inside the Redis database',
      'Maintain consistent data when applications react to changing real-time conditions in the keyspace instead of using Pub/Sub notifications',
      'Improve code resiliency by backing up and replicating triggers and functions along with the database'
    ],
    additionalText: ['Triggers and functions work with a JavaScript engine, which lets you take advantage of JavaScript’s vast ecosystem of libraries and frameworks and modern, expressive syntax.'],
    link: 'https://redis.io/docs/interact/programmability/functions-intro'
  },
}

export const MODULE_TEXT_VIEW: { [key in RedisDefaultModules]?: string } = {
  [RedisDefaultModules.Bloom]: 'RedisBloom',
  [RedisDefaultModules.ReJSON]: 'RedisJSON',
  [RedisDefaultModules.Search]: 'RediSearch',
  [RedisDefaultModules.TimeSeries]: 'RedisTimeSeries',
  [RedisDefaultModules.RedisGears]: 'triggers and functions',
}
