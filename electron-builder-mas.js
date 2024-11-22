const electronBuilder = require('./electron-builder.json')

const config = {
  ...electronBuilder,
  npmRebuild: true,
  appId: 'com.redis.RedisInsight',
}

module.exports = config
