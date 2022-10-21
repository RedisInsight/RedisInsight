enum ApiEndpoints {
  INSTANCE = 'instance',
  CA_CERTIFICATES = 'instance/certificates/ca',
  CLIENT_CERTIFICATES = 'instance/certificates/client',
  INSTANCE_REDIS_CLUSTER = 'instance/redis-enterprise-dbs',
  REDIS_CLUSTER_DATABASES = 'redis-enterprise/cluster/get-dbs',
  INSTANCE_REDIS_CLOUD = 'instance/redis-cloud-dbs',
  INSTANCE_SENTINEL_MASTERS = 'instance/sentinel-masters',
  REDIS_CLOUD_ACCOUNT = 'redis-enterprise/cloud/get-account',
  REDIS_CLOUD_SUBSCRIPTIONS = 'redis-enterprise/cloud/get-subscriptions',
  REDIS_CLOUD_DATABASES = 'redis-enterprise/cloud/get-databases',
  SENTINEL_MASTERS = 'sentinel/get-masters',
  KEYS = 'keys',
  KEYS_METADATA = 'keys/get-metadata',
  KEY_INFO = 'keys/get-info',
  KEY_NAME = 'keys/name',
  KEY_TTL = 'keys/ttl',
  ZSET = 'zSet',
  ZSET_MEMBERS = 'zSet/members',
  ZSET_MEMBERS_SEARCH = 'zSet/search',
  ZSET_GET_MEMBERS = 'zSet/get-members',
  SET = 'set',
  SET_GET_MEMBERS = 'set/get-members',
  SET_MEMBERS = 'set/members',
  STRING = 'string',
  STRING_VALUE = 'string/get-value',
  HASH = 'hash',
  HASH_FIELDS = 'hash/fields',
  HASH_GET_FIELDS = 'hash/get-fields',
  LIST = 'list',
  LIST_GET_ELEMENTS = 'list/get-elements',
  LIST_DELETE_ELEMENTS = 'list/elements',
  REJSON = 'rejson-rl',
  REJSON_GET = 'rejson-rl/get',
  REJSON_SET = 'rejson-rl/set',
  REJSON_ARRAPPEND = 'rejson-rl/arrappend',
  STREAMS_ENTRIES = 'streams/entries',
  STREAMS_ENTRIES_GET = 'streams/entries/get',
  STREAMS_CONSUMER_GROUPS = 'streams/consumer-groups',
  STREAMS_CONSUMER_GROUPS_GET = 'streams/consumer-groups/get',
  STREAMS_CONSUMERS = 'streams/consumer-groups/consumers',
  STREAMS_CONSUMERS_GET = 'streams/consumer-groups/consumers/get',
  STREAMS_CONSUMERS_MESSAGES_GET = 'streams/consumer-groups/consumers/pending-messages/get',
  STREAMS = 'streams',
  STREAM_CLAIM_PENDING_MESSAGES = 'streams/consumer-groups/consumers/pending-messages/claim',
  STREAM_ACK_PENDING_ENTRIES = 'streams/consumer-groups/consumers/pending-messages/ack',
  CLI = 'cli',
  CLI_BLOCKING_COMMANDS = 'info/cli-blocking-commands',
  CLI_UNSUPPORTED_COMMANDS = 'info/cli-unsupported-commands',
  SEND_COMMAND = 'send-command',
  SEND_CLUSTER_COMMAND = 'send-cluster-command',
  COMMAND_EXECUTIONS = 'command-executions',
  INFO = 'info',
  SETTINGS = 'settings',
  SETTINGS_AGREEMENTS_SPEC = 'settings/agreements/spec',
  WORKBENCH_COMMAND_EXECUTIONS = 'workbench/command-executions',
  WORKBENCH_COMMANDS_EXECUTION = 'workbench/commands-execution',
  PROFILER = 'profiler',
  PROFILER_LOGS = 'profiler/logs',

  REDIS_COMMANDS = 'commands',
  GUIDES = 'static/guides/guides.json',
  // TODO double check it, when tutorials will be completed
  TUTORIALS = 'static/tutorials/tutorials.json',
  PLUGINS = 'plugins',
  STATE = 'state',
  CONTENT_CREATE_DATABASE = 'static/content/create-redis.json',
  GUIDES_PATH = 'static/guides',
  TUTORIALS_PATH = 'static/tutorials',

  SLOW_LOGS = 'slow-logs',
  SLOW_LOGS_CONFIG = 'slow-logs/config',

  PUB_SUB = 'pub-sub',
  PUB_SUB_MESSAGES = 'pub-sub/messages',
  CLUSTER_DETAILS = 'cluster-details',
  DATABASE_ANALYSIS = 'analysis',

  NOTIFICATIONS = 'notifications',
  NOTIFICATIONS_READ = 'notifications/read',
}

export const DEFAULT_SEARCH_MATCH = '*'

const SCAN_COUNT_DEFAULT_ENV = process.env.SCAN_COUNT_DEFAULT || '500'
const PIPELINE_COUNT_DEFAULT_ENV = process.env.PIPELINE_COUNT_DEFAULT || '5'
const SCAN_TREE_COUNT_DEFAULT_ENV = process.env.SCAN_TREE_COUNT_DEFAULT || '10000'

export const SCAN_COUNT_DEFAULT = parseInt(SCAN_COUNT_DEFAULT_ENV, 10)
export const PIPELINE_COUNT_DEFAULT = parseInt(PIPELINE_COUNT_DEFAULT_ENV, 10)
export const SCAN_TREE_COUNT_DEFAULT = parseInt(SCAN_TREE_COUNT_DEFAULT_ENV, 10)
export const SCAN_STREAM_START_DEFAULT = '-'
export const SCAN_STREAM_END_DEFAULT = '+'

export default ApiEndpoints
