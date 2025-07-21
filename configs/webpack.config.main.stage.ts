import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import mainProdConfig from './webpack.config.main.prod.ts'
import DeleteSourceMaps from '../scripts/DeleteSourceMaps.js'

DeleteSourceMaps()

export default merge(mainProdConfig, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'staging',
    }),
  ],
})
