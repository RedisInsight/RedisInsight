const electronBuilder = require('./electron-builder.json');

const config = {
  ...electronBuilder,
  appId: 'com.redis.RedisInsight',
  productName: 'RedisInsight',
  mac: {
    ...electronBuilder.mac,
    bundleVersion: process.env.CIRCLE_BUILD_NUM || '70',
  },
};

module.exports = config;
