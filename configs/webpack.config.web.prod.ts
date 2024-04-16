import { merge } from 'webpack-merge';
import { resolve } from 'path';
import webpack from 'webpack';
import { toString } from 'lodash';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import commonConfig from './webpack.config.web.common';
import DeleteDistWeb from '../scripts/DeleteDistWeb';
import HtmlWebpackPlugin from 'html-webpack-plugin';

DeleteDistWeb();

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {};

const configuration: webpack.Configuration = {
  ...devtoolsConfig,

  mode: 'production',
  target: 'web',
  entry: ['regenerator-runtime/runtime', './index.tsx'],
  output: {
    filename: 'js/bundle.[name].[fullhash].min.js',
    path: resolve(__dirname, '../redisinsight/ui/dist'),
    publicPath: '/',
    chunkFilename: '[id].[chunkhash].js'
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "reactVendor"
        },
        elasticVendor: {
          test: /[\\/]node_modules[\\/](@elastic)[\\/]/,
          name: "elasticVendor"
        },
        monacoVendor: {
          test: /[\\/]node_modules[\\/](monaco-editor)[\\/]/,
          name: "monacoVendor"
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](lodash)[\\/]/,
          name: "utilityVendor"
        },
        vendor: {
          test: /[\\/]node_modules[\\/](!@elastic)(!monaco-editor)(!lodash)[\\/]/,
          name: "vendor"
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css',
      chunkFilename: '[id].[fullhash].css',
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: 'index.html.ejs',
      publicPath: '{{ RIPROXYPATH }}',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      RI_APP_TYPE: 'web',
      RI_APP_PORT: '5540',
      RI_BASE_API_URL: '',
      RI_API_PREFIX: 'api',
      RI_SCAN_COUNT_DEFAULT: '500',
      RI_SCAN_TREE_COUNT_DEFAULT: '10000',
      RI_PIPELINE_COUNT_DEFAULT: '5',
      RI_SEGMENT_WRITE_KEY:
        'RI_SEGMENT_WRITE_KEY' in process.env ? process.env.RI_SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
      RI_CONNECTIONS_TIMEOUT_DEFAULT: 'RI_CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.RI_CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000), // 30 sec
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
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
    ],
  },
  externals: {},
};

export default merge(commonConfig, configuration);
