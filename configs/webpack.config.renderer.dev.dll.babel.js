import webpack from 'webpack';
import path from 'path';
import { merge } from 'webpack-merge';
import { toString } from 'lodash'
import baseConfig from './webpack.config.base';
import { dependencies } from '../package.json';
import { dependencies as dependenciesApi } from '../redisinsight/package.json';

console.log('dependenciesApi', dependenciesApi);

const dist = path.join(__dirname, '../dll');

export default merge(baseConfig, {
  context: path.join(__dirname, '..'),

  devtool: 'eval',

  mode: 'development',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify', 'hiredis'],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: require('./webpack.config.renderer.dev.babel').default.module,

  entry: {
    renderer: [...Object.keys(dependencies || {}), ...Object.keys(dependenciesApi || {})],
  },

  output: {
    library: 'renderer',
    path: dist,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var',
  },

  stats: 'errors-only',

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      APP_ENV: 'electron',
      API_PREFIX: 'api',
      BASE_API_URL: 'http://localhost',
      RESOURCES_BASE_URL: 'http://localhost',
      SCAN_COUNT_DEFAULT: '500',
      SCAN_TREE_COUNT_DEFAULT: '10000',
      PIPELINE_COUNT_DEFAULT: '5',
      SEGMENT_WRITE_KEY:
      'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
      CONNECTIONS_TIMEOUT_DEFAULT: 'CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000), // 30 sec
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.join(__dirname, '..'),
        output: {
          path: path.join(__dirname, '../dll'),
        },
      },
    }),

  ],
});
