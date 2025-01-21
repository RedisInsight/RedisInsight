/* eslint global-require: off, import/no-extraneous-dependencies: off */
const developmentEnv = ['development', 'test']
module.exports = (api) => {
  const development = api.env(developmentEnv)

  return {
    presets: [
      require('@babel/preset-env'),
      require('@babel/preset-typescript'),
      [require('@babel/preset-react'), { development }],
      [require('babel-preset-vite'), { env: true, glob: false }],
    ],
  }
}
