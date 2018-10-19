// @ts-ignore
import BrotliPlugin from 'brotli-webpack-plugin';
// @ts-ignore
import CompressionPlugin from 'compression-webpack-plugin';
import ExtractCssChunksPlugin from 'extract-css-chunks-webpack-plugin';
// @ts-ignore
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
// @ts-ignore
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import * as path from 'path';
// @ts-ignore
import StatsPlugin from 'stats-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
// @ts-ignore
import WebpackBar from 'webpackbar';
import { Bundle, Stage } from '../types';

const APP_ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

export const plugins = ({ stage, bundle }: { readonly stage: Stage; readonly bundle: Bundle }) =>
  [
    new webpack.EnvironmentPlugin({
      ...process.env,
      NODE_ENV: JSON.stringify(stage === 'dev' ? 'development' : 'production'),
    }),
    // tslint:disable-next-line no-any deprecation
    new webpack.NormalModuleReplacementPlugin(/^@reactivex\/ix-es2015-cjs(.*)$/, (resource: any) => {
      // tslint:disable-next-line no-object-mutation
      resource.request = resource.request.replace(/^@reactivex\/ix-es2015-cjs(.*)$/, '@reactivex/ix-esnext-esm$1');
    }),
    new WebpackBar({ profile: true }),
  ]
    .concat(
      stage === 'dev'
        ? [
            new HardSourceWebpackPlugin({
              cacheDirectory: path.resolve(APP_ROOT_DIR, 'node_modules', '.cache', 'hswp', stage, bundle),
              cachePrune: {
                sizeThreshold: 1024 * 1024 * 1024,
              },
            }),
          ]
        : [],
    )
    .concat(
      stage === 'dev' || stage === 'node'
        ? []
        : [
            new LodashModuleReplacementPlugin(),
            new ExtractCssChunksPlugin({
              filename: '[name].[chunkHash:8].css',
              chunkFilename: '[id].[chunkHash:8].css',
            }),
            new CompressionPlugin({
              filename: '[path].gz[query]',
              algorithm: 'gzip',
              test: /\.(js|css|html|svg|woff|woff2|png)$/,
              threshold: 1024,
              minRatio: 0.8,
              cache: true,
            }),
            new BrotliPlugin({
              asset: '[path].br[query]',
              test: /\.(js|css|html|svg|woff|woff2|png)$/,
              threshold: 1024,
              minRatio: 0.8,
            }),
          ],
    )
    .concat(
      process.env.NEO_ONE_ANALYZE === 'true' && stage !== 'node'
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
            }),
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              defaultSizes: 'gzip',
              reportFilename: 'report-gzip.html',
            }),
            new StatsPlugin('full-stats.json', {
              chunkModules: true,
            }),
          ]
        : [],
    );