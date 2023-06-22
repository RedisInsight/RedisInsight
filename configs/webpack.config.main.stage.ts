import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { toString } from 'lodash';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import mainProdConfig from './webpack.config.main.prod';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';
import { version } from '../redisinsight/package.json';

DeleteSourceMaps();

export default merge(mainProdConfig, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'staging',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      APP_ENV: 'electron',
      SERVER_TLS: true,
      SERVER_TLS_CERT: process.env.SERVER_TLS_CERT || '',
      SERVER_TLS_KEY: process.env.SERVER_TLS_KEY || '',
      APP_FOLDER_NAME: process.env.APP_FOLDER_NAME || '',
      UPGRADES_LINK: process.env.UPGRADES_LINK || '',
      RI_HOSTNAME: '127.0.0.1',
      BUILD_TYPE: 'ELECTRON',
      APP_VERSION: version,
      AWS_BUCKET_NAME: 'AWS_BUCKET_NAME' in process.env ? process.env.AWS_BUCKET_NAME : '',
      SEGMENT_WRITE_KEY: 'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
      CONNECTIONS_TIMEOUT_DEFAULT: 'CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000), // 30 sec
    }),
  ],
});
