import path from 'path';
import webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { dependencies as externals } from '../redisinsight/package.json';

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '..'),
    // commonjs2 https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.scss'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '..', 'tsconfig.json'),
      }),
    ],
    alias: {
      src: path.resolve(__dirname, '../redisinsight/api/src'),
      apiSrc: path.resolve(__dirname, '../redisinsight/api/src'),
      uiSrc: path.resolve(__dirname, '../redisinsight/ui/src'),
    },
    modules: [path.join(__dirname, '../redisinsight/api'), 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
    }),

    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          'ssh2',
          '@nestjs/microservices',
          // '@nestjs/platform-express',
          // 'pnpapi',
          'cache-manager',
          // 'class-validator',
          '@fastify/static',
          'fastify-swagger',
          // 'hiredis',
          // 'reflect-metadata',
          // 'swagger-ui-express',
          // 'class-transformer',
          // 'class-transformer/storage',
          // '@nestjs/websockets',
          // '@nestjs/core/adapters/http-adapter',
          // '@nestjs/core/helpers/router-method-factory',
          // '@nestjs/core/metadata-scanner',
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
