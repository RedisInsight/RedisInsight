/**
 * Base webpack config used across other specific configs for web
 */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
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

    new HtmlWebpackPlugin({ template: 'index.html.ejs' }),

    new MonacoWebpackPlugin({
      languages: ['yaml', 'typescript', 'javascript', 'json', 'sql'],
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker'
          }
        }
      ],
      features: ['!rename']
    }),

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
