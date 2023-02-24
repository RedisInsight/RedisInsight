import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { spawn } from 'child_process';
import { toString } from 'lodash'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import baseConfig from './webpack.config.base';
import { version } from '../redisinsight/package.json';

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dllDir = path.join(__dirname, '../dll');
const manifest = path.resolve(dllDir, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes('webpack.config.renderer.dev.dll');

function employCache(loaders) {
  return ['cache-loader'].concat(loaders);
}

export default merge(baseConfig, {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-renderer',

  entry: [
    'core-js',
    'regenerator-runtime/runtime',
    // require.resolve('../redisinsight/main.renderer.ts'),
    require.resolve('../redisinsight/ui/indexElectron.tsx'),
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.dev.js',
  },

  resolve: {
    alias: {
      apiSrc: path.resolve(__dirname, '../redisinsight/api/src'),
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
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, '../dll'),
          manifest: require(manifest),
          sourceType: 'var',
        }),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      APP_ENV: 'electron',
      API_PREFIX: 'api',
      BASE_API_URL: 'http://localhost',
      RESOURCES_BASE_URL: 'http://localhost',
      SCAN_COUNT_DEFAULT: '500',
      SCAN_TREE_COUNT_DEFAULT: '10000',
      PIPELINE_COUNT_DEFAULT: '5',
      BUILD_TYPE: 'ELECTRON',
      APP_VERSION: version,
      SEGMENT_WRITE_KEY:
        'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
      CONNECTIONS_TIMEOUT_DEFAULT: 'CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000), // 30 sec
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new ReactRefreshWebpackPlugin(),

    new MonacoWebpackPlugin({ languages: ['json'], features: ['!rename'] }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: false,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    before() {
      console.log('Starting Main Process...');
      spawn('npm', ['run', 'start:main'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(code))
        .on('error', (spawnError) => console.error(spawnError));
    },
  },
});
