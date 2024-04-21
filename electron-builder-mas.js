const electronBuilder = require('./electron-builder.json');

const config = {
  ...electronBuilder,
  appId: 'com.redis.RedisInsight',
  productName: 'RedisInsight',
  mac: {
    ...electronBuilder.mac,
    notarize: {
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
};

module.exports = config;
