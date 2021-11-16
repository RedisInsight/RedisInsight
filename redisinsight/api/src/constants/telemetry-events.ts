export enum TelemetryEvents {
  // Main events
  ApplicationFirstStart = 'APPLICATION_FIRST_START',
  ApplicationStarted = 'APPLICATION_STARTED',
  AnalyticsPermission = 'ANALYTICS_PERMISSION',
  SettingsScanThresholdChanged = 'SETTINGS_KEYS_TO_SCAN_CHANGED',

  // Events for redis instances
  RedisInstanceAdded = 'CONFIG_DATABASES_DATABASE_ADDED',
  RedisInstanceAddFailed = 'CONFIG_DATABASES_DATABASE_ADD_FAILED',
  RedisInstanceDeleted = 'CONFIG_DATABASES_DATABASE_DELETED',
  RedisInstanceEditedByUser = 'CONFIG_DATABASES_DATABASE_EDITED_BY_USER',
  RedisInstanceConnectionFailed = 'DATABASE_CONNECTION_FAILED',

  // Events for autodiscovery flows
  REClusterDiscoverySucceed = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUCCEEDED',
  REClusterDiscoveryFailed = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_FAILED',
  RECloudSubscriptionsDiscoverySucceed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_SUCCEEDED',
  RECloudSubscriptionsDiscoveryFailed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_FAILED',
  RECloudDatabasesDiscoverySucceed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_DATABASES_SUCCEEDED',
  RECloudDatabasesDiscoveryFailed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_DATABASES_FAILED',
  SentinelMasterGroupsDiscoverySucceed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUCCEEDED',
  SentinelMasterGroupsDiscoveryFailed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_FAILED',

  // Events for browser tool
  BrowserKeysScanned = 'BROWSER_KEYS_SCANNED',
  BrowserKeysScannedWithFilters = 'BROWSER_KEYS_SCANNED_WITH_FILTER_ENABLED',
  BrowserKeyAdded = 'BROWSER_KEY_ADDED',
  BrowserKeyTTLChanged = 'BROWSER_KEY_TTL_CHANGED',
  BrowserKeysDeleted = 'BROWSER_KEYS_DELETED',
  BrowserKeyValueFiltered = 'BROWSER_KEY_VALUE_FILTERED',
  BrowserKeyValueAdded = 'BROWSER_KEY_VALUE_ADDED',
  BrowserKeyValueEdited = 'BROWSER_KEY_VALUE_EDITED',
  BrowserKeyValueRemoved = 'BROWSER_KEY_VALUE_REMOVED',
  BrowserKeyValueDeleted = 'BROWSER_KEY_VALUE_FILTERED',
  BrowserJSONPropertyEdited = 'BROWSER_JSON_PROPERTY_EDITED',
  BrowserJSONPropertyAdded = 'BROWSER_JSON_PROPERTY_ADDED',
  BrowserJSONPropertyDeleted = 'BROWSER_JSON_PROPERTY_DELETED',

  // Events for cli tool
  CliClientCreated = 'CLI_CLIENT_CREATED',
  CliClientCreationFailed = 'CLI_CLIENT_CREATION_FAILED',
  CliClientConnectionError = 'CLI_CLIENT_CONNECTION_ERROR',
  CliClientDeleted = 'CLI_CLIENT_DELETED',
  CliClientRecreated = 'CLI_CLIENT_RECREATED',
  CliCommandExecuted = 'CLI_COMMAND_EXECUTED',
  CliClusterNodeCommandExecuted = 'CLI_CLUSTER_COMMAND_EXECUTED',
  CliCommandErrorReceived = 'CLI_COMMAND_ERROR_RECEIVED',
}
