import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import rendererProdConfig from './webpack.config.renderer.prod.babel';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

DeleteSourceMaps();

export default merge(baseConfig, {
  ...rendererProdConfig,

  plugins: [
    ...rendererProdConfig.plugins,

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'staging',
      DEBUG_PROD: false,
      API_PREFIX: 'api',
      BASE_API_URL: process.env.SERVER_TLS_CERT && process.env.SERVER_TLS_KEY ? 'https://localhost' : 'http://localhost',
      RESOURCES_BASE_URL: process.env.SERVER_TLS_CERT && process.env.SERVER_TLS_KEY ? 'https://localhost' : 'http://localhost',
      APP_ENV: 'electron',
      SCAN_COUNT_DEFAULT: '500',
      SEGMENT_WRITE_KEY:
        'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
    }),
  ],
});
