/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import webpack from 'webpack';
import { merge } from 'webpack-merge';
import commonConfig from './webpack.config.web.common.babel';

function employCache(loaders) {
  return ['cache-loader'].concat(loaders);
}

export default merge(commonConfig, {
  target: 'web',

  mode: 'development',

  devtool: 'source-map',

  entry: [
    'regenerator-runtime/runtime',
    'webpack-dev-server/client?http://localhost:8080',
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
              outputPath: 'static',
              publicPath: 'static',
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
              outputPath: 'static',
              publicPath: 'static',
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
              outputPath: 'static',
              publicPath: 'static',
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
    port: 8080,
    hot: true, // enable HMR on the server
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
      APP_ENV: 'web',
      API_PREFIX: 'api',
      API_PORT: '5001',
      BASE_API_URL: `http://${require('os').hostname()}`,
      RESOURCES_BASE_URL: `http://${require('os').hostname()}`,
      SCAN_COUNT_DEFAULT: '500',
      SCAN_TREE_COUNT_DEFAULT: '10000',
      SEGMENT_WRITE_KEY:
        'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
  ],

  externals: {
    react: 'React',
  },
});
