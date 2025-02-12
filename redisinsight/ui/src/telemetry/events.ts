/* eslint-disable max-len */
export enum TelemetryEvent {
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  UPDATE_NOTIFICATION_DISPLAYED = 'UPDATE_NOTIFICATION_DISPLAYED',
  UPDATE_NOTIFICATION_RESTART_CLICKED = 'UPDATE_NOTIFICATION_RESTART_CLICKED',
  UPDATE_NOTIFICATION_CLOSED = 'UPDATE_NOTIFICATION_CLOSED',
  CONSENT_MENU_VIEWED = 'CONSENT_MENU_VIEWED',

  CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED = 'CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED',
  CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED = 'CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED',
  CONFIG_DATABASES_DATABASE_EDIT_CLICKED = 'CONFIG_DATABASES_DATABASE_EDIT_CLICKED',
  CONFIG_DATABASES_DATABASE_EDIT_CANCELLED_CLICKED = 'CONFIG_DATABASES_DATABASE_EDIT_CANCELLED_CLICKED',
  CONFIG_DATABASES_DATABASE_LIST_SORTED = 'CONFIG_DATABASES_DATABASE_LIST_SORTED',
  CONFIG_DATABASES_DATABASE_LIST_SEARCHED = 'CONFIG_DATABASES_DATABASE_LIST_SEARCHED',

  CONFIG_DATABASES_HOST_PORT_COPIED = 'CONFIG_DATABASES_HOST_PORT_COPIED',
  CONFIG_DATABASES_ADD_FORM_DISMISSED = 'CONFIG_DATABASES_ADD_FORM_DISMISSED',
  CONFIG_DATABASES_OPEN_DATABASE = 'CONFIG_DATABASES_OPEN_DATABASE',
  NAVIGATION_PANEL_OPENED = 'NAVIGATION_PANEL_OPENED',
  CONFIG_DATABASES_CLICKED = 'CONFIG_DATABASES_CLICKED',
  CONFIG_DATABASES_MANUALLY_SUBMITTED = 'CONFIG_DATABASES_MANUALLY_SUBMITTED',
  CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUBMITTED = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUBMITTED',
  CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_CANCELLED = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_CANCELLED',
  CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBMITTED = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBMITTED',
  CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_CANCELLED = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_CANCELLED',
  CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED',
  CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_CANCELLED = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_CANCELLED',
  CONFIG_DATABASES_GET_REDIS_CLOUD_ACCOUNT_CLICKED = 'CONFIG_DATABASES_GET_REDIS_CLOUD_ACCOUNT_CLICKED',
  CREATE_FREE_CLOUD_DATABASE_CLICKED = 'CREATE_FREE_CLOUD_DATABASE_CLICKED',
  CONFIG_DATABASES_DATABASE_CLONE_REQUESTED = 'CONFIG_DATABASES_DATABASE_CLONE_REQUESTED',
  CONFIG_DATABASES_DATABASE_CLONE_CANCELLED = 'CONFIG_DATABASES_DATABASE_CLONE_CANCELLED',
  CONFIG_DATABASES_DATABASE_CLONE_CONFIRMED = 'CONFIG_DATABASES_DATABASE_CLONE_CONFIRMED',
  CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED = 'CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED',
  CONFIG_DATABASES_REDIS_IMPORT_CANCELLED = 'CONFIG_DATABASES_REDIS_IMPORT_CANCELLED',
  CONFIG_DATABASES_REDIS_IMPORT_CLICKED = 'CONFIG_DATABASES_REDIS_IMPORT_CLICKED',
  CONFIG_DATABASES_REDIS_EXPORT_CLICKED = 'CONFIG_DATABASES_REDIS_EXPORT_CLICKED',
  CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED = 'CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED',
  CONFIG_DATABASES_REDIS_EXPORT_FAILED = 'CONFIG_DATABASES_REDIS_EXPORT_FAILED',
  CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED = 'CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED',
  CONFIG_DATABASES_TEST_CONNECTION_CLICKED = 'CONFIG_DATABASES_TEST_CONNECTION_CLICKED',

  BUILD_FROM_SOURCE_CLICKED = 'BUILD_FROM_SOURCE_CLICKED',
  BUILD_USING_DOCKER_CLICKED = 'BUILD_USING_DOCKER_CLICKED',
  BUILD_USING_HOMEBREW_CLICKED = 'BUILD_USING_HOMEBREW_CLICKED',

  INSTANCES_TAB_CHANGED = 'INSTANCES_TAB_CHANGED',

  BROWSER_KEY_ADD_BUTTON_CLICKED = 'BROWSER_KEY_ADD_BUTTON_CLICKED',
  BROWSER_KEY_BULK_ACTIONS_BUTTON_CLICKED = 'BROWSER_KEY_BULK_ACTIONS_BUTTON_CLICKED',
  BROWSER_KEY_ADD_CANCELLED = 'BROWSER_KEY_ADD_CANCELLED',
  BROWSER_KEY_DELETE_CLICKED = 'BROWSER_KEY_DELETE_CLICKED',
  BROWSER_KEY_VALUE_REMOVE_CLICKED = 'BROWSER_KEY_VALUE_REMOVE_CLICKED',
  BROWSER_KEY_ADD_VALUE_CLICKED = 'BROWSER_KEY_ADD_VALUE_CLICKED',
  BROWSER_KEY_ADD_VALUE_CANCELLED = 'BROWSER_KEY_ADD_VALUE_CANCELLED',
  BROWSER_KEY_COPIED = 'BROWSER_KEY_COPIED',
  BROWSER_JSON_KEY_EXPANDED = 'BROWSER_JSON_KEY_EXPANDED',
  BROWSER_JSON_KEY_COLLAPSED = 'BROWSER_JSON_KEY_COLLAPSED',
  BROWSER_KEY_ADDED = 'BROWSER_KEY_ADDED',
  BROWSER_KEY_VALUE_FILTERED = 'BROWSER_KEY_VALUE_FILTERED',
  BROWSER_KEY_TTL_CHANGED = 'BROWSER_KEY_TTL_CHANGED',
  BROWSER_KEY_VALUE_ADDED = 'BROWSER_KEY_VALUE_ADDED',
  BROWSER_KEY_VALUE_REMOVED = 'BROWSER_KEY_VALUE_REMOVED',
  BROWSER_KEY_VALUE_EDITED = 'BROWSER_KEY_VALUE_EDITED',
  BROWSER_FIELD_TTL_EDITED = 'BROWSER_FIELD_TTL_EDITED',
  BROWSER_JSON_PROPERTY_EDITED = 'BROWSER_JSON_PROPERTY_EDITED',
  BROWSER_JSON_PROPERTY_DELETED = 'BROWSER_JSON_PROPERTY_DELETED',
  BROWSER_JSON_PROPERTY_ADDED = 'BROWSER_JSON_PROPERTY_ADDED',
  BROWSER_JSON_VALUE_IMPORT_CLICKED = 'BROWSER_JSON_VALUE_IMPORT_CLICKED',
  BROWSER_KEYS_ADDITIONALLY_SCANNED = 'BROWSER_KEYS_ADDITIONALLY_SCANNED',
  BROWSER_KEYS_SCANNED_WITH_FILTER_ENABLED = 'BROWSER_KEYS_SCANNED_WITH_FILTER_ENABLED',
  BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED = 'BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED',
  BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED = 'BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED',
  BROWSER_KEY_DETAILS_AUTO_REFRESH_ENABLED = 'BROWSER_KEY_DETAILS_AUTO_REFRESH_ENABLED',
  BROWSER_KEY_DETAILS_AUTO_REFRESH_DISABLED = 'BROWSER_KEY_DETAILS_AUTO_REFRESH_DISABLED',
  BROWSER_KEY_VALUE_VIEWED = 'BROWSER_KEY_VALUE_VIEWED',
  BROWSER_KEY_DETAILS_FULL_SCREEN_ENABLED = 'BROWSER_KEY_DETAILS_FULL_SCREEN_ENABLED',
  BROWSER_KEY_DETAILS_FULL_SCREEN_DISABLED = 'BROWSER_KEY_DETAILS_FULL_SCREEN_DISABLED',
  BROWSER_KEY_FIELD_VALUE_EXPANDED = 'BROWSER_KEY_FIELD_VALUE_EXPANDED',
  BROWSER_KEY_FIELD_VALUE_COLLAPSED = 'BROWSER_KEY_FIELD_VALUE_COLLAPSED',
  BROWSER_KEY_DETAILS_FORMATTER_CHANGED = 'BROWSER_KEY_DETAILS_FORMATTER_CHANGED',
  BROWSER_WORKBENCH_LINK_CLICKED = 'BROWSER_WORKBENCH_LINK_CLICKED',
  BROWSER_DATABASE_INDEX_CHANGED = 'BROWSER_DATABASE_INDEX_CHANGED',
  BROWSER_FILTER_MODE_CHANGE_FAILED = 'BROWSER_FILTER_MODE_CHANGE_FAILED',
  SHOW_BROWSER_COLUMN_CLICKED = 'SHOW_BROWSER_COLUMN_CLICKED',
  LIST_VIEW_OPENED = 'LIST_VIEW_OPENED',

  CLI_OPENED = 'CLI_OPENED',
  CLI_CLOSED = 'CLI_CLOSED',
  CLI_MINIMIZED = 'CLI_MINIMIZED',
  CLI_COMMAND_SUBMITTED = 'CLI_COMMAND_SUBMITTED',
  CLI_WORKBENCH_LINK_CLICKED = 'CLI_WORKBENCH_LINK_CLICKED',
  COMMAND_HELPER_OPENED = 'COMMAND_HELPER_OPENED',
  COMMAND_HELPER_CLOSED = 'COMMAND_HELPER_CLOSED',
  COMMAND_HELPER_MINIMIZED = 'COMMAND_HELPER_MINIMIZED',
  COMMAND_HELPER_INFO_DISPLAYED_FOR_CLI_INPUT = 'COMMAND_HELPER_INFO_DISPLAYED_FOR_CLI_INPUT',
  COMMAND_HELPER_COMMAND_FILTERED = 'COMMAND_HELPER_COMMAND_FILTERED',
  COMMAND_HELPER_COMMAND_OPENED = 'COMMAND_HELPER_COMMAND_OPENED',

  SETTINGS_COLOR_THEME_CHANGED = 'SETTINGS_COLOR_THEME_CHANGED',
  SETTINGS_NOTIFICATION_MESSAGES_ENABLED = 'SETTINGS_NOTIFICATION_MESSAGES_ENABLED',
  SETTINGS_NOTIFICATION_MESSAGES_DISABLED = 'SETTINGS_NOTIFICATION_MESSAGES_DISABLED',
  SETTINGS_DATE_TIME_FORMAT_CHANGED = 'SETTINGS_DATE_TIME_FORMAT_CHANGED',
  SETTINGS_TIME_ZONE_CHANGED = 'SETTINGS_TIME_ZONE_CHANGED',
  SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED = 'SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED',
  SETTINGS_CLOUD_API_KEY_NAME_COPIED = 'SETTINGS_CLOUD_API_KEY_NAME_COPIED',
  SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED = 'SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED',
  SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED = 'SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED',
  SETTINGS_CLOUD_API_KEYS_REMOVED = 'SETTINGS_CLOUD_API_KEYS_REMOVED',
  SETTINGS_CLOUD_API_KEY_SORTED = 'SETTINGS_CLOUD_API_KEY_SORTED',

  STRING_LOAD_ALL_CLICKED = 'STRING_LOAD_ALL_CLICKED',
  STRING_DOWNLOAD_VALUE_CLICKED = 'STRING_DOWNLOAD_VALUE_CLICKED',

  WORKBENCH_COMMAND_SUBMITTED = 'WORKBENCH_COMMAND_SUBMITTED',
  WORKBENCH_COMMAND_COPIED = 'WORKBENCH_COMMAND_COPIED',
  WORKBENCH_COMMAND_RUN_AGAIN = 'WORKBENCH_COMMAND_RUN_AGAIN',
  WORKBENCH_COMMAND_PROFILE = 'WORKBENCH_COMMAND_PROFILE',
  WORKBENCH_COMMAND_DELETE_COMMAND = 'WORKBENCH_COMMAND_DELETE_COMMAND',
  WORKBENCH_RESULTS_IN_FULL_SCREEN = 'WORKBENCH_RESULTS_IN_FULL_SCREEN',
  WORKBENCH_RESULTS_COLLAPSED = 'WORKBENCH_RESULTS_COLLAPSED',
  WORKBENCH_RESULTS_EXPANDED = 'WORKBENCH_RESULTS_EXPANDED',
  WORKBENCH_RESULT_VIEW_CHANGED = 'WORKBENCH_RESULT_VIEW_CHANGED',
  WORKBENCH_NON_REDIS_EDITOR_OPENED = 'WORKBENCH_NON_REDIS_EDITOR_OPENED',
  WORKBENCH_NON_REDIS_EDITOR_CANCELLED = 'WORKBENCH_NON_REDIS_EDITOR_CANCELLED',
  WORKBENCH_NON_REDIS_EDITOR_SAVED = 'WORKBENCH_NON_REDIS_EDITOR_SAVED',
  WORKBENCH_MODE_CHANGED = 'WORKBENCH_MODE_CHANGED',
  WORKBENCH_CLEAR_RESULT_CLICKED = 'WORKBENCH_CLEAR_RESULT_CLICKED',
  WORKBENCH_CLEAR_ALL_RESULTS_CLICKED = 'WORKBENCH_CLEAR_ALL_RESULTS_CLICKED',

  PROFILER_OPENED = 'PROFILER_OPENED',
  PROFILER_STARTED = 'PROFILER_STARTED',
  PROFILER_STOPPED = 'PROFILER_STOPPED',
  PROFILER_PAUSED = 'PROFILER_PAUSED',
  PROFILER_RESUMED = 'PROFILER_RESUMED',
  PROFILER_CLEARED = 'PROFILER_CLEARED',
  PROFILER_CLOSED = 'PROFILER_CLOSED',
  PROFILER_MINIMIZED = 'PROFILER_MINIMIZED',

  TREE_VIEW_OPENED = 'TREE_VIEW_OPENED',
  TREE_VIEW_KEY_ADD_BUTTON_CLICKED = 'TREE_VIEW_KEY_ADD_BUTTON_CLICKED',
  TREE_VIEW_KEY_BULK_ACTIONS_BUTTON_CLICKED = 'TREE_VIEW_KEY_BULK_ACTIONS_BUTTON_CLICKED',
  TREE_VIEW_KEY_ADD_CANCELLED = 'TREE_VIEW_KEY_ADD_CANCELLED',
  TREE_VIEW_KEY_VALUE_FILTERED = 'TREE_VIEW_KEY_VALUE_FILTERED',
  TREE_VIEW_KEY_TTL_CHANGED = 'TREE_VIEW_KEY_TTL_CHANGED',
  TREE_VIEW_KEY_ADD_VALUE_CLICKED = 'TREE_VIEW_KEY_ADD_VALUE_CLICKED',
  TREE_VIEW_KEY_ADD_VALUE_CANCELLED = 'TREE_VIEW_KEY_ADD_VALUE_CANCELLED',
  TREE_VIEW_KEY_VALUE_ADDED = 'TREE_VIEW_KEY_VALUE_ADDED',
  TREE_VIEW_KEY_VALUE_REMOVE_CLICKED = 'TREE_VIEW_KEY_VALUE_REMOVE_CLICKED',
  TREE_VIEW_KEY_DELETE_CLICKED = 'TREE_VIEW_KEY_DELETE_CLICKED',
  TREE_VIEW_KEY_VALUE_REMOVED = 'TREE_VIEW_KEY_VALUE_REMOVED',
  TREE_VIEW_KEY_VALUE_EDITED = 'TREE_VIEW_KEY_VALUE_EDITED',
  TREE_VIEW_FIELD_TTL_EDITED = 'TREE_VIEW_FIELD_TTL_EDITED',
  TREE_VIEW_KEY_COPIED = 'TREE_VIEW_KEY_COPIED',
  TREE_VIEW_JSON_KEY_EXPANDED = 'TREE_VIEW_JSON_KEY_EXPANDED',
  TREE_VIEW_JSON_KEY_COLLAPSED = 'TREE_VIEW_JSON_KEY_COLLAPSED',
  TREE_VIEW_JSON_PROPERTY_EDITED = 'TREE_VIEW_JSON_PROPERTY_EDITED',
  TREE_VIEW_JSON_PROPERTY_DELETED = 'TREE_VIEW_JSON_PROPERTY_DELETED',
  TREE_VIEW_JSON_PROPERTY_ADDED = 'TREE_VIEW_JSON_PROPERTY_ADDED',
  TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED = 'TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED',
  TREE_VIEW_KEYS_ADDITIONALLY_SCANNED = 'TREE_VIEW_KEYS_ADDITIONALLY_SCANNED',
  TREE_VIEW_DELIMITER_CHANGED = 'TREE_VIEW_DELIMITER_CHANGED',
  TREE_VIEW_KEYS_SORTED = 'TREE_VIEW_KEYS_SORTED',
  TREE_VIEW_KEY_ADDED = 'TREE_VIEW_KEY_ADDED',
  TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED = 'TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED',
  TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED = 'TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED',
  TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED = 'TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED',
  TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED = 'TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED',
  TREE_VIEW_KEY_VALUE_VIEWED = 'TREE_VIEW_KEY_VALUE_VIEWED',
  TREE_VIEW_KEY_DETAILS_FULL_SCREEN_ENABLED = 'TREE_VIEW_KEY_DETAILS_FULL_SCREEN_ENABLED',
  TREE_VIEW_KEY_DETAILS_FULL_SCREEN_DISABLED = 'TREE_VIEW_KEY_DETAILS_FULL_SCREEN_DISABLED',
  TREE_VIEW_KEY_FIELD_VALUE_EXPANDED = 'TREE_VIEW_KEY_FIELD_VALUE_EXPANDED',
  TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED = 'TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED',
  TREE_VIEW_KEY_DETAILS_FORMATTER_CHANGED = 'TREE_VIEW_KEY_DETAILS_FORMATTER_CHANGED',
  TREE_VIEW_WORKBENCH_LINK_CLICKED = 'TREE_VIEW_WORKBENCH_LINK_CLICKED',
  SHOW_HASH_TTL_CLICKED = 'SHOW_HASH_TTL_CLICKED',

  SLOWLOG_LOADED = 'SLOWLOG_LOADED',
  SLOWLOG_CLEARED = 'SLOWLOG_CLEARED',
  SLOWLOG_SET_LOG_SLOWER_THAN = 'SLOWLOG_SET_LOG_SLOWER_THAN',
  SLOWLOG_SET_MAX_LEN = 'SLOWLOG_SET_MAX_LEN',
  SLOWLOG_SORTED = 'SLOWLOG_SORTED',
  SLOWLOG_AUTO_REFRESH_ENABLED = 'SLOWLOG_AUTO_REFRESH_ENABLED',
  SLOWLOG_AUTO_REFRESH_DISABLED = 'SLOWLOG_AUTO_REFRESH_DISABLED',

  STREAM_DATA_FILTERED = 'STREAM_DATA_FILTERED',
  STREAM_DATA_FILTER_RESET = 'STREAM_DATA_FILTER_RESET',
  STREAM_CONSUMER_GROUPS_LOADED = 'STREAM_CONSUMER_GROUPS_LOADED',
  STREAM_CONSUMER_GROUP_CREATED = 'STREAM_CONSUMER_GROUP_CREATED',
  STREAM_CONSUMER_GROUP_DELETED = 'STREAM_CONSUMER_GROUP_DELETED',
  STREAM_CONSUMER_GROUP_ID_SET = 'STREAM_CONSUMER_GROUP_ID_SET',
  STREAM_CONSUMERS_LOADED = 'STREAM_CONSUMERS_LOADED',
  STREAM_CONSUMER_MESSAGE_ACKNOWLEDGED = 'STREAM_CONSUMER_MESSAGE_ACKNOWLEDGED',
  STREAM_CONSUMER_MESSAGE_CLAIMED = 'STREAM_CONSUMER_MESSAGE_CLAIMED',
  STREAM_CONSUMER_MESSAGE_CLAIM_CANCELED = 'STREAM_CONSUMER_MESSAGE_CLAIM_CANCELED',
  STREAM_CONSUMER_DELETED = 'STREAM_CONSUMER_DELETED',

  PUBSUB_MESSAGES_CLEARED = 'PUBSUB_MESSAGES_CLEARED',
  PUBSUB_AUTOSCROLL_PAUSED = 'PUBSUB_AUTOSCROLL_PAUSED',
  PUBSUB_AUTOSCROLL_RESUMED = 'PUBSUB_AUTOSCROLL_RESUMED',

  NOTIFICATIONS_HISTORY_OPENED = 'NOTIFICATIONS_HISTORY_OPENED',
  NOTIFICATIONS_MESSAGE_CLOSED = 'NOTIFICATIONS_MESSAGE_CLOSED',

  BULK_ACTIONS_OPENED = 'BULK_ACTIONS_OPENED',
  BULK_ACTIONS_WARNING = 'BULK_ACTIONS_WARNING',
  BULK_ACTIONS_CANCELLED = 'BULK_ACTIONS_CANCELLED',

  DATABASE_ANALYSIS_STARTED = 'DATABASE_ANALYSIS_STARTED',
  DATABASE_ANALYSIS_HISTORY_VIEWED = 'DATABASE_ANALYSIS_HISTORY_VIEWED',
  DATABASE_ANALYSIS_EXTRAPOLATION_CHANGED = 'DATABASE_ANALYSIS_EXTRAPOLATION_CHANGED',
  DATABASE_ANALYSIS_TIPS_CLICKED = 'DATABASE_ANALYSIS_TIPS_CLICKED',
  DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED = 'DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED',
  DATABASE_ANALYSIS_TIPS_EXPANDED = 'DATABASE_ANALYSIS_TIPS_EXPANDED',
  DATABASE_ANALYSIS_TIPS_COLLAPSED = 'DATABASE_ANALYSIS_TIPS_COLLAPSED',
  DATABASE_ANALYSIS_TIPS_VOTED = 'DATABASE_ANALYSIS_TIPS_VOTED',
  DATABASE_TIPS_TUTORIAL_CLICKED = 'DATABASE_TIPS_TUTORIAL_CLICKED',
  DATABASE_TIPS_KEY_COPIED = 'DATABASE_TIPS_KEY_COPIED',

  USER_SURVEY_LINK_CLICKED = 'USER_SURVEY_LINK_CLICKED',
  IMPORT_SAMPLES_CLICKED = 'IMPORT_SAMPLES_CLICKED',
  SEARCH_MODE_CHANGED = 'SEARCH_MODE_CHANGED',
  SEARCH_MODE_CHANGE_FAILED = 'SEARCH_MODE_CHANGE_FAILED',
  SEARCH_INDEX_CHANGED = 'SEARCH_INDEX_CHANGED',
  SEARCH_INDEX_ADD_BUTTON_CLICKED = 'SEARCH_INDEX_ADD_BUTTON_CLICKED',
  SEARCH_INDEX_ADD_CANCELLED = 'SEARCH_INDEX_ADD_CANCELLED',
  SEARCH_KEYS_SEARCHED = 'SEARCH_KEYS_SEARCHED',
  SEARCH_INDEX_ADDED = 'SEARCH_INDEX_ADDED',
  ONBOARDING_TOUR_CLICKED = 'ONBOARDING_TOUR_CLICKED',
  ONBOARDING_TOUR_ACTION_MADE = 'ONBOARDING_TOUR_ACTION_MADE',
  ONBOARDING_TOUR_TRIGGERED = 'ONBOARDING_TOUR_TRIGGERED',
  ONBOARDING_TOUR_FINISHED = 'ONBOARDING_TOUR_FINISHED',

  RELEASE_NOTES_LINK_CLICKED = 'RELEASE_NOTES_LINK_CLICKED',

  INSIGHTS_PANEL_OPENED = 'INSIGHTS_PANEL_OPENED',
  INSIGHTS_PANEL_CLOSED = 'INSIGHTS_PANEL_CLOSED',
  INSIGHTS_PANEL_TAB_CHANGED = 'INSIGHTS_PANEL_TAB_CHANGED',
  INSIGHTS_PANEL_FULL_SCREEN_CLICKED = 'INSIGHTS_PANEL_FULL_SCREEN_CLICKED',
  INSIGHTS_TIPS_TUTORIAL_CLICKED = 'INSIGHTS_TIPS_TUTORIAL_CLICKED',
  INSIGHTS_TIPS_VOTED = 'INSIGHTS_TIPS_VOTED',
  INSIGHTS_TIPS_SNOOZED = 'INSIGHTS_TIPS_SNOOZED',
  INSIGHTS_TIPS_HIDE = 'INSIGHTS_TIPS_HIDE',
  INSIGHTS_TIPS_SHOW_HIDDEN = 'INSIGHTS_TIPS_SHOW_HIDDEN',
  INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED = 'INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED',
  INSIGHTS_TIPS_KEY_COPIED = 'INSIGHTS_TIPS_KEY_COPIED',
  INSIGHTS_TIPS_LINK_CLICKED = 'INSIGHTS_TIPS_LINK_CLICKED',

  EXPLORE_PANEL_COMMAND_COPIED = 'EXPLORE_PANEL_COMMAND_COPIED',
  EXPLORE_PANEL_COMMAND_RUN_CLICKED = 'EXPLORE_PANEL_COMMAND_RUN_CLICKED',
  EXPLORE_PANEL_DATABASE_CHANGE_CLICKED = 'EXPLORE_PANEL_DATABASE_CHANGE_CLICKED',
  EXPLORE_PANEL_IMPORT_CLICKED = 'EXPLORE_PANEL_IMPORT_CLICKED',
  EXPLORE_PANEL_IMPORT_SUBMITTED = 'EXPLORE_PANEL_IMPORT_SUBMITTED',
  EXPLORE_PANEL_TUTORIAL_DELETED = 'EXPLORE_PANEL_TUTORIAL_DELETED',
  EXPLORE_PANEL_TUTORIAL_OPENED = 'EXPLORE_PANEL_TUTORIAL_OPENED',
  EXPLORE_PANEL_LINK_CLICKED = 'EXPLORE_PANEL_LINK_CLICKED',
  EXPLORE_PANEL_CREATE_TUTORIAL_LINK_CLICKED = 'EXPLORE_PANEL_CREATE_TUTORIAL_LINK_CLICKED',
  EXPLORE_PANEL_DATA_UPLOAD_CLICKED = 'EXPLORE_PANEL_DATA_UPLOAD_CLICKED',
  EXPLORE_PANEL_DATA_UPLOAD_SUBMITTED = 'EXPLORE_PANEL_DATA_UPLOAD_SUBMITTED',
  EXPLORE_PANEL_DOWNLOAD_BULK_FILE_CLICKED = 'EXPLORE_PANEL_DOWNLOAD_BULK_FILE_CLICKED',

  AI_CHAT_SESSION_RESTARTED = 'AI_CHAT_SESSION_RESTARTED',
  AI_CHAT_BOT_MESSAGE_DISPLAYED = 'AI_CHAT_BOT_NEW_FEATURE_MESSAGE_DISPLAYED',
  AI_CHAT_BOT_MESSAGE_CLICKED = 'AI_CHAT_BOT_NEW_FEATURE_MESSAGE_CLICKED',
  AI_CHAT_OPENED = 'AI_CHAT_OPENED',
  AI_CHAT_MESSAGE_SENT = 'AI_CHAT_MESSAGE_SENT',
  AI_CHAT_BOT_COMMAND_RUN_CLICKED = 'AI_CHAT_BOT_COMMAND_RUN_CLICKED',
  AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED = 'AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED',
  AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED = 'AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED',
  AI_CHAT_BOT_TERMS_DISPLAYED = 'AI_CHAT_BOT_TERMS_DISPLAYED',
  AI_CHAT_BOT_TERMS_ACCEPTED = 'AI_CHAT_BOT_TERMS_ACCEPTED',

  CAPABILITY_POPOVER_DISPLAYED = 'CAPABILITY_POPOVER_DISPLAYED',

  CLOUD_FREE_DATABASE_CLICKED = 'CLOUD_FREE_DATABASE_CLICKED',
  CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED = 'CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED',
  CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED = 'CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED',
  CLOUD_SIGN_IN_SSO_OPTION_CANCELED = 'CLOUD_SIGN_IN_SSO_OPTION_CANCELED',
  CLOUD_SIGN_IN_FORM_CLOSED = 'CLOUD_SIGN_IN_FORM_CLOSED',
  CLOUD_SIGN_IN_CLICKED = 'CLOUD_SIGN_IN_CLICKED',
  CLOUD_SIGN_IN_SUCCEEDED = 'CLOUD_SIGN_IN_SUCCEEDED',
  CLOUD_SIGN_IN_FAILED = 'CLOUD_SIGN_IN_FAILED',
  CLOUD_SIGN_IN_ACCOUNT_SELECTED = 'CLOUD_SIGN_IN_ACCOUNT_SELECTED',
  CLOUD_SIGN_IN_ACCOUNT_FORM_CLOSED = 'CLOUD_SIGN_IN_ACCOUNT_FORM_CLOSED',
  CLOUD_SIGN_IN_ACCOUNT_FAILED = 'CLOUD_SIGN_IN_ACCOUNT_FAILED',
  CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED = 'CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED',
  CLOUD_IMPORT_DATABASES_CLICKED = 'CLOUD_IMPORT_DATABASES_CLICKED',
  CLOUD_IMPORT_DATABASES_SUBMITTED = 'CLOUD_IMPORT_DATABASES_SUBMITTED',
  CLOUD_API_KEY_REMOVED = 'CLOUD_API_KEY_REMOVED',
  CLOUD_LINK_CLICKED = 'CLOUD_LINK_CLICKED',
  CLOUD_IMPORT_EXISTING_DATABASE = 'CLOUD_IMPORT_EXISTING_DATABASE',
  CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED = 'CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED',
  CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION = 'CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION',
  CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED = 'CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED',
  CLOUD_PROFILE_OPENED = 'CLOUD_PROFILE_OPENED',
  CLOUD_ACCOUNT_SWITCHED = 'CLOUD_ACCOUNT_SWITCHED',
  CLOUD_CONSOLE_CLICKED = 'CLOUD_CONSOLE_CLICKED',
  CLOUD_SIGN_OUT_CLICKED = 'CLOUD_SIGN_OUT_CLICKED',
  CLOUD_NOT_USED_DB_NOTIFICATION_VIEWED = 'CLOUD_NOT_USED_DB_NOTIFICATION_VIEWED',

  RDI_INSTANCE_LIST_SORTED = 'RDI_INSTANCE_LIST_SORTED',
  RDI_INSTANCE_SINGLE_DELETE_CLICKED = 'RDI_INSTANCE_SINGLE_DELETE_CLICKED',
  RDI_INSTANCE_MULTIPLE_DELETE_CLICKED = 'RDI_INSTANCE_MULTIPLE_DELETE_CLICKED',
  RDI_INSTANCE_LIST_SEARCHED = 'RDI_INSTANCE_LIST_SEARCHED',
  RDI_INSTANCE_URL_COPIED = 'RDI_INSTANCE_URL_COPIED',
  RDI_INSTANCE_ADD_CLICKED = 'RDI_INSTANCE_ADD_CLICKED',
  RDI_INSTANCE_ADD_CANCELLED = 'RDI_INSTANCE_ADD_CANCELLED',
  RDI_INSTANCE_SUBMITTED = 'RDI_INSTANCE_SUBMITTED',
  OPEN_RDI_CLICKED = 'OPEN_RDI_CLICKED',
  RDI_ENDPOINT_ADDED = 'RDI_ENDPOINT_ADDED',
  RDI_ENDPOINT_ADD_FAILED = 'RDI_ENDPOINT_ADD_FAILED',
  RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED = 'RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED',
  RDI_DEPLOY_CLICKED = 'RDI_DEPLOY_CLICKED',
  RDI_PIPELINE_RESET_CLICKED = 'RDI_PIPELINE_RESET_CLICKED',
  RDI_PIPELINE_RESET = 'RDI_PIPELINE_RESET',
  RDI_PIPELINE_START_CLICKED = 'RDI_PIPELINE_START_CLICKED',
  RDI_PIPELINE_STARTED = 'RDI_PIPELINE_STARTED',
  RDI_PIPELINE_STOP_CLICKED = 'RDI_PIPELINE_STOP_CLICKED',
  RDI_PIPELINE_STOPPED = 'RDI_PIPELINE_STOPPED',
  RDI_TEST_JOB_OPENED = 'RDI_TEST_JOB_OPENED',
  RDI_PIPELINE_DOWNLOAD_CLICKED = 'RDI_PIPELINE_DOWNLOAD_CLICKED',
  RDI_PIPELINE_UPLOAD_FROM_FILE_CLICKED = 'RDI_PIPELINE_UPLOAD_FROM_FILE_CLICKED',
  RDI_PIPELINE_UPLOAD_SUCCEEDED = 'RDI_PIPELINE_UPLOAD_SUCCEEDED',
  RDI_PIPELINE_UPLOAD_FAILED = 'RDI_PIPELINE_UPLOAD_FAILED',
  RDI_TEST_CONNECTIONS_CLICKED = 'RDI_TEST_CONNECTIONS_CLICKED',
  RDI_TEST_JOB_RUN = 'RDI_TEST_JOB_RUN',
  RDI_PIPELINE_JOB_CREATED = 'RDI_PIPELINE_JOB_CREATED',
  RDI_PIPELINE_JOB_DELETED = 'RDI_PIPELINE_JOB_DELETED',
  RDI_TEMPLATE_CLICKED = 'RDI_TEMPLATE_CLICKED',
  RDI_STATISTICS_REFRESH_CLICKED = 'RDI_STATISTICS_REFRESH_CLICKED',
  RDI_STATISTICS_AUTO_REFRESH_ENABLED = 'RDI_STATISTICS_AUTO_REFRESH_ENABLED',
  RDI_STATISTICS_AUTO_REFRESH_DISABLED = 'RDI_STATISTICS_AUTO_REFRESH_DISABLED',
  RDI_START_OPTION_SELECTED = 'RDI_START_OPTION_SELECTED',
  RDI_DEDICATED_EDITOR_LANGUAGE_CHANGED = 'RDI_DEDICATED_EDITOR_LANGUAGE_CHANGED',
  RDI_DEDICATED_EDITOR_OPENED = 'RDI_DEDICATED_EDITOR_OPENED',
  RDI_DEDICATED_EDITOR_CANCELLED = 'RDI_DEDICATED_EDITOR_CANCELLED',
  RDI_DEDICATED_EDITOR_SAVED = 'RDI_DEDICATED_EDITOR_SAVED',
  RDI_UNSAVED_CHANGES_MESSAGE_DISPLAYED = 'RDI_UNSAVED_CHANGES_MESSAGE_DISPLAYED',

  CONFIG_DATABASES_CERTIFICATE_REMOVED = 'CONFIG_DATABASES_CERTIFICATE_REMOVED',

  OVERVIEW_AUTO_REFRESH_ENABLED = 'OVERVIEW_AUTO_REFRESH_ENABLED',
  OVERVIEW_AUTO_REFRESH_DISABLED = 'OVERVIEW_AUTO_REFRESH_DISABLED'
}
