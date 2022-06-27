export default {
  server: {
    env: 'test',
    requestTimeout: 1000,
  },
  profiler: {
    logFileIdleThreshold: parseInt(process.env.PROFILER_LOG_FILE_IDLE_THRESHOLD, 10) || 1000 * 3, // 3sec
  },
  notifications: {
    updateUrl: 'https://s3.amazonaws.com/redisinsight.test/public/tests/notifications.json',
  },
};
