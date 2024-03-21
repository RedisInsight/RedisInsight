import 'webpack-dev-server';
import path from 'path';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import { version } from '../redisinsight/package.json';

const port = process.env.PORT || 1212;
const manifest = path.resolve(webpackPaths.dllPath, 'renderer.json');
const skipDLLs =
  module.parent?.filename.includes('webpack.config.renderer.dev.dll') ||
  module.parent?.filename.includes('webpack.config.eslint');

const htmlPagesNames = ['splash.ejs', 'index.ejs']
/**
 * Warn if the DLL is not built
 */
if (
  !skipDLLs &&
  !(fs.existsSync(webpackPaths.dllPath) && fs.existsSync(manifest))
) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'
    )
  );
  execSync('npm run postinstall');
}

function employCache(loaders) {
  return ['cache-loader'].concat(loaders);
}

const configuration: webpack.Configuration = {
  devtool: 'source-map',

  mode: 'development',

  target: ['web', 'electron-renderer'],

  entry: [
    `webpack-dev-server/client?http://localhost:${port}/dist`,
    'webpack/hot/only-dev-server',
    path.join(webpackPaths.uiPath, 'indexElectron.tsx'),
  ],

  output: {
    path: webpackPaths.desktopPath,
    publicPath: '/',
    filename: 'renderer.dev.js',
    library: {
      type: 'umd',
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
      },
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
      // SASS lazy support
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
    ...(skipDLLs
      ? []
      : [
          new webpack.DllReferencePlugin({
            context: webpackPaths.dllPath,
            manifest: require(manifest),
            sourceType: 'var',
          }),
        ]),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new ReactRefreshWebpackPlugin(),

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

    ...htmlPagesNames.map((htmlPageName) => (
      new HtmlWebpackPlugin({
        filename: path.join(`${htmlPageName.split('.')?.[0]}.html`),
        template: path.join(webpackPaths.desktopPath, htmlPageName),
        minify: {
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
        },
        isBrowser: false,
        env: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV !== 'production',
        nodeModules: webpackPaths.appNodeModulesPath,
      })
    )),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.RI_APP_TYPE': JSON.stringify('web'),
      'process.env.RI_API_PREFIX': JSON.stringify('api'),
      'process.env.RI_BASE_API_URL': JSON.stringify('http://localhost'),
      'process.env.RI_RESOURCES_BASE_URL': JSON.stringify('http://localhost'),
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

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    compress: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: {
      publicPath: '/',
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: true,
    },
    setupMiddlewares(middlewares) {
      console.log('Starting preload.js builder...');
      const preloadProcess = spawn('npm', ['run', 'start:preload'], {
        shell: true,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(code))
        .on('error', (spawnError) => console.error(spawnError));

      console.log('Starting Main Process...');
      let args = ['run', 'start:main'];
      if (process.env.MAIN_ARGS) {
        args = args.concat(
          ['--', ...process.env.MAIN_ARGS.matchAll(/"[^"]+"|[^\s"]+/g)].flat()
        );
      }
      spawn('npm', args, {
        shell: true,
        stdio: 'inherit',
      })
        .on('close', (code) => {
          preloadProcess.kill();
          process.exit(code);
        })
        .on('error', (spawnError) => console.error(spawnError));
      return middlewares;
    },
  },
};

export default merge(baseConfig, configuration);
