export default {
  server: {
    env: 'test',
    requestTimeout: 1000,
  },
  db: {
    synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : true,
    migrationsRun: process.env.DB_MIGRATIONS ? process.env.DB_MIGRATIONS === 'true' : false,
  },
  profiler: {
    logFileIdleThreshold: parseInt(process.env.PROFILER_LOG_FILE_IDLE_THRESHOLD, 10) || 1000 * 2, // 3sec
  },
  notifications: {
    updateUrl: 'https://s3.amazonaws.com/redisinsight.test/public/tests/notifications.json',
  },
  features_config: {
    url: process.env.RI_FEATURES_CONFIG_URL
      // eslint-disable-next-line max-len
      || 'http://localhost:5551/remote/features-config.json',
  },
};
