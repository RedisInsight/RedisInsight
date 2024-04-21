const electronBuilder = require('./electron-builder.json');

const config = {
  ...electronBuilder,
  appId: 'com.redis.RedisInsight',
  productName: 'RedisInsight',
};

module.exports = config;
