export default {
  server: {
    env: 'test',
    requestTimeout: parseInt(process.env.RI_REQUEST_TIMEOUT, 10) || 1000,
  },
  db: {
    synchronize: process.env.RI_DB_SYNC ? process.env.RI_DB_SYNC === 'true' : true,
    migrationsRun: process.env.RI_DB_MIGRATIONS ? process.env.RI_DB_MIGRATIONS === 'true' : false,
  },
  profiler: {
    logFileIdleThreshold: parseInt(process.env.RI_PROFILER_LOG_FILE_IDLE_THRESHOLD, 10) || 1000 * 2, // 3sec
  },
  notifications: {
    updateUrl: process.env.RI_NOTIFICATION_UPDATE_URL
      || 'https://s3.amazonaws.com/redisinsight.test/public/tests/notifications.json',
  },
  features_config: {
    url: process.env.RI_FEATURES_CONFIG_URL
      || 'http://localhost:5551/remote/features-config.json',
  },
};
