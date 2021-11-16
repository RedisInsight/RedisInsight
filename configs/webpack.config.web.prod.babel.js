import { merge } from 'webpack-merge';
import { resolve } from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import commonConfig from './webpack.config.web.common.babel';
import DeleteDistWeb from '../scripts/DeleteDistWeb';

DeleteDistWeb();

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {};

export default merge(commonConfig, {
  ...devtoolsConfig,

  mode: 'production',
  target: 'web',
  entry: ['regenerator-runtime/runtime', './index.tsx'],
  output: {
    filename: 'js/bundle.[fullhash].min.js',
    path: resolve(__dirname, '../redisinsight/ui/dist'),
    publicPath: '/',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css',
      chunkFilename: '[id].[fullhash].css',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      APP_ENV: 'web',
      API_PORT: '5000',
      API_PREFIX: '',
      BASE_API_URL: 'api/',
      RESOURCES_BASE_URL:
        process.env.SERVER_TLS_CERT && process.env.SERVER_TLS_KEY ? 'https://localhost' : 'http://localhost',
      SCAN_COUNT_DEFAULT: '500',
      SEGMENT_WRITE_KEY:
        'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
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
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
});
