/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from 'path';
import os from 'os';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { toString } from 'lodash'
import commonConfig from './webpack.config.web.common';

function employCache(loaders) {
  return ['cache-loader'].concat(loaders);
}

const getLocalIpAddress = () => {
  const ifaces = os.networkInterfaces();

  for (const ifaceName of Object.keys(ifaces)) {
    const firstIpv4Address = ifaces[ifaceName].find(alias => alias.family === 'IPv4' && !alias.internal);

    if (firstIpv4Address) {
      return firstIpv4Address.address;
    }
  }

  return 'localhost';
};


const HOST = process.env.PUBLIC_DEV ? getLocalIpAddress(): 'localhost';

const configuration: webpack.Configuration = {
  target: 'web',

  mode: 'development',

  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    cacheDirectory: path.resolve(__dirname, '../.temp_cache'),
    name: 'webpack',
    maxAge: 86_400_000, // 1 day
    buildDependencies: {
      // This makes all dependencies of this file - build dependencies
      config: [__filename],
    }
  },

  devtool: 'source-map',

  entry: [
    'regenerator-runtime/runtime',
    `webpack-dev-server/client?http://${HOST}:8080`,
    'webpack/hot/only-dev-server',
    require.resolve('../redisinsight/ui/index.tsx'),
  ],

  module: {
    rules: [
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: [/\.module.(s(a|c)ss)$/, /\.lazy\.s(a|c)ss$/i],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.lazy\.s(a|c)ss$/i,
        use: employCache([
          {
            loader: 'style-loader',
            options: { injectType: 'lazySingletonStyleTag' },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ]),
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash]-[name].[ext]',
              outputPath: 'fonts',
              publicPath: 'fonts',
            },
          },
        ],
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        exclude: /codicon\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash]-[name].[ext]',
              outputPath: 'fonts',
              publicPath: 'fonts',
            },
          },
        ],
      },
      // TTF codicon font
      {
        test: /codicon\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader',
      },
      // OTF Font
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash]-[name].[ext]',
              outputPath: 'fonts',
              publicPath: 'fonts',
            },
          },
        ],
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
    ],
  },

  devServer: {
    host: HOST,
    allowedHosts: 'all',
    port: 8080,
    historyApiFallback: true,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behavior between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be override with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      RI_APP_TYPE: 'web',
      RI_API_PREFIX: 'api',
      RI_BASE_API_URL: `http://${HOST}`,
      RI_RESOURCES_BASE_URL: `http://${HOST}`,
      RI_PIPELINE_COUNT_DEFAULT: '5',
      RI_SCAN_COUNT_DEFAULT: '500',
      RI_SCAN_TREE_COUNT_DEFAULT: '10000',
      RI_SEGMENT_WRITE_KEY:
        'RI_SEGMENT_WRITE_KEY' in process.env ? process.env.RI_SEGMENT_WRITE_KEY : 'RI_SEGMENT_WRITE_KEY',
      RI_CONNECTIONS_TIMEOUT_DEFAULT: 'RI_CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.RI_CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000),
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
  ],

  externals: {
    // react: 'React',
  },
};

export default merge(commonConfig, configuration);
