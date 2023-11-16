export default {
  server: {
    tls: process.env.RI_SERVER_TLS
      ? process.env.RI_SERVER_TLS === 'true'
      : false,
  },
  sockets: {
    cors: true,
  },
  db: {
    synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : true,
    migrationsRun: process.env.DB_MIGRATIONS
      ? process.env.DB_MIGRATIONS === 'true'
      : false,
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || 'debug',
    stdout: process.env.STDOUT_LOGGER
      ? process.env.STDOUT_LOGGER === 'true'
      : true, // enabled by default
    omitSensitiveData: process.env.LOGGER_OMIT_DATA
      ? process.env.LOGGER_OMIT_DATA === 'true'
      : false,
  },
};
