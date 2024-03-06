import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';
import webpackPaths from './webpack.paths';
import { version } from '../redisinsight/package.json';

DeleteSourceMaps();

const htmlPagesNames = ['splash.ejs', 'index.ejs']
const apiUrl = process.env.RI_SERVER_TLS_CERT && process.env.RI_SERVER_TLS_KEY
  ? 'https://localhost'
  : 'http://localhost'

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {};

const configuration: webpack.Configuration = {
  ...devtoolsConfig,

  target: ['web', 'electron-renderer'],

  entry: [path.join(webpackPaths.uiPath, 'indexElectron.tsx')],

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: 'renderer.js',
    library: {
      type: 'umd',
    },
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },

  module: {
    rules: [
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: [/\.module.(s(a|c)ss)$/, /\.lazy\.s(a|c)ss$/i],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      // SASS lazy support
      {
        test: /\.lazy\.s(a|c)ss$/i,
        use: [
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
        ],
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

  plugins: [
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

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    ...htmlPagesNames.map((htmlPageName) => (
      new HtmlWebpackPlugin({
        filename: path.join(`${htmlPageName.split('.')?.[0]}.html`),
        template: path.join(webpackPaths.desktopPath, htmlPageName),
        isBrowser: false,
        isDevelopment: false,
      })
    )),

    new webpack.DefinePlugin({
      'process.type': '"renderer"',
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.RI_APP_TYPE': JSON.stringify('electron'),
      'process.env.RI_API_PREFIX': JSON.stringify('api'),
      'process.env.RI_BASE_API_URL': JSON.stringify(apiUrl),
      'process.env.RI_RESOURCES_BASE_URL': JSON.stringify(apiUrl),
      'process.env.RI_SCAN_COUNT_DEFAULT': JSON.stringify('500'),
      'process.env.RI_SCAN_TREE_COUNT_DEFAULT': JSON.stringify('10000'),
      'process.env.RI_PIPELINE_COUNT_DEFAULT': JSON.stringify('5'),
      'process.env.RI_BUILD_TYPE': JSON.stringify('ELECTRON'),
      'process.env.RI_APP_VERSION': JSON.stringify(version),
      'process.env.RI_CONNECTIONS_TIMEOUT_DEFAULT': 'RI_CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? JSON.stringify(process.env.RI_CONNECTIONS_TIMEOUT_DEFAULT)
        : JSON.stringify(30 * 1000),
      'process.env.RI_SEGMENT_WRITE_KEY': 'RI_SEGMENT_WRITE_KEY' in process.env
        ? JSON.stringify(process.env.RI_SEGMENT_WRITE_KEY)
        : JSON.stringify('SOURCE_WRITE_KEY'),
    }),
  ],
};

export default merge(baseConfig, configuration);
