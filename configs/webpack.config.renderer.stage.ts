import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import rendererProdConfig from './webpack.config.renderer.prod';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';
import { version } from '../redisinsight/package.json';

DeleteSourceMaps();

export default merge(baseConfig, {
  ...rendererProdConfig,

  plugins: [
    ...rendererProdConfig.plugins,

    new webpack.DefinePlugin({
      'process.type': '"renderer"',
      'process.env.NODE_ENV': JSON.stringify('staging'),
      'process.env.APP_ENV': JSON.stringify('electron'),
      'process.env.API_PREFIX': JSON.stringify('api'),
      'process.env.BASE_API_URL': JSON.stringify('http://localhost'),
      'process.env.RESOURCES_BASE_URL': JSON.stringify('http://localhost'),
      'process.env.SCAN_COUNT_DEFAULT': JSON.stringify('500'),
      'process.env.SCAN_TREE_COUNT_DEFAULT': JSON.stringify('10000'),
      'process.env.PIPELINE_COUNT_DEFAULT': JSON.stringify('5'),
      'process.env.BUILD_TYPE': JSON.stringify('ELECTRON'),
      'process.env.APP_VERSION': JSON.stringify(version),
      'process.env.CONNECTIONS_TIMEOUT_DEFAULT': 'CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? JSON.stringify(process.env.CONNECTIONS_TIMEOUT_DEFAULT)
        : JSON.stringify(30 * 1000),
      'process.env.SEGMENT_WRITE_KEY': 'SEGMENT_WRITE_KEY' in process.env
        ? JSON.stringify(process.env.SEGMENT_WRITE_KEY)
        : JSON.stringify('SOURCE_WRITE_KEY'),
    }),
  ],
});
