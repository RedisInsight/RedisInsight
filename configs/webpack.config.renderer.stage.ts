import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import rendererProdConfig from './webpack.config.renderer.prod';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

DeleteSourceMaps();

export default merge(baseConfig, {
  ...rendererProdConfig,

  devtool: 'source-map',

  plugins: [
    ...rendererProdConfig.plugins,

    new webpack.DefinePlugin({
      'process.type': '"renderer"',
      'process.env.NODE_ENV': JSON.stringify('staging'),
    }),
  ],
});
