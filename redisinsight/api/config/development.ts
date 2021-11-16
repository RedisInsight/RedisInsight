export default {
  server: {
    tls: process.env.SERVER_TLS ? process.env.SERVER_TLS === 'true' : false,
  },
  db: {
    synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : true,
    migrationsRun: process.env.DB_MIGRATIONS ? process.env.DB_MIGRATIONS === 'true' : false,
  },
  logger: {
    stdout: process.env.STDOUT_LOGGER ? process.env.STDOUT_LOGGER === 'true' : true, // enabled by default
    omitSensitiveData: process.env.LOGGER_OMIT_DATA ? process.env.LOGGER_OMIT_DATA === 'true' : false,
  },
};
