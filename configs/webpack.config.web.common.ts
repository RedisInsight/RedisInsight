/**
 * Base webpack config used across other specific configs for web
 */
import path from 'path';
import webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../redisinsight/package.json';
import { dependencies as externalsApi } from '../redisinsight/api/package.json';

export default {
  target: 'web',

  externals: [...Object.keys(externals || {}), ...Object.keys(externalsApi || {})],

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        include: [webpackPaths.uiPath],
        exclude: [
          /node_modules/,
          webpackPaths.apiPath,
          webpackPaths.desktopPath,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: 'string-replace-loader',
            options: {
              search: /import (\w+) from '(.+?)\.svg\?react'/g,
              replace: "import { ReactComponent as $1 } from '$2.svg'",
            },
          },
        ]
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },

  ignoreWarnings: [
    {
      module: /elastic.scss/,
    },
    {
      module: /QueryCardHeader/,
    },
    {
      module: /\/(dark|light)Theme.scss/,
    },
  ],

  context: webpackPaths.uiPath,

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '..', 'tsconfig.json'),
      }),
    ],
    fallback: {
      os: false,
    },

    modules: ['node_modules', path.join(__dirname, '../node_modules')],
  },

  plugins: [
    new webpack.DefinePlugin({
      'window.app.config.apiPort': JSON.stringify('5540'),
    }),

    new MonacoWebpackPlugin({ languages: ['json', 'javascript', 'typescript'], features: ['!rename'] }),

    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/platform-express',
          'pnpapi',
          'stream',
          'os',
          'os-browserify',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'fastify-static',
          'fastify-swagger',
          'reflect-metadata',
          'swagger-ui-express',
          'class-transformer/storage',
          // '@nestjs/websockets',
          '@nestjs/microservices/microservices-module',
          // '@nestjs/websockets/socket-module',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ],
};
