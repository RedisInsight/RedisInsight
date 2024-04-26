import webpack from 'webpack';
import path from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import { dependencies } from '../package.json';
import { dependencies as dependenciesApi } from '../redisinsight/package.json';

console.log('dependenciesApi', dependenciesApi);

const dist = webpackPaths.dllPath;

export default merge(baseConfig, {
  context: webpackPaths.rootPath,

  devtool: 'eval',

  mode: 'development',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify', 'hiredis'],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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

      // TODO remove after regression
      // // WOFF Font
      // {
      //   test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       limit: 10000,
      //       mimetype: 'application/font-woff',
      //     },
      //   },
      // },
      // // WOFF2 Font
      // {
      //   test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[hash]-[name].[ext]',
      //         outputPath: 'fonts',
      //         publicPath: 'fonts',
      //       },
      //     },
      //   ],
      // },
      // // OTF Font
      // {
      //   test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[hash]-[name].[ext]',
      //         outputPath: 'fonts',
      //         publicPath: 'fonts',
      //       },
      //     },
      //   ],
      // },
      // // EOT Font
      // {
      //   test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      //   use: 'file-loader',
      // },
      // {
      //   test: /\.svg$/,
      //   use: ['@svgr/webpack', 'url-loader'],
      // },
      // // Common Image Formats
      // {
      //   test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
      //   use: 'url-loader',
      // },
    ],
  },

  entry: {
    renderer: [...Object.keys(dependencies || {}), ...Object.keys(dependenciesApi || {})],
  },

  output: {
    path: dist,
    filename: '[name].dev.dll.js',
    library: {
      name: 'renderer',
      type: 'var',
    },
  },

  stats: 'errors-only',

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: webpackPaths.desktopPath,
        output: {
          path: webpackPaths.dllPath,
        },
      },
    }),
  ],
});
