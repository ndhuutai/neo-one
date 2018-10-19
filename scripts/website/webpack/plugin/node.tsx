// tslint:disable no-any
import * as path from 'path';
import * as React from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import webpack from 'webpack';
// @ts-ignore
import nodeExternals from 'webpack-node-externals';
// @ts-ignore
import { InjectManifest } from 'workbox-webpack-plugin';
import { Stage } from '../../types';
import { node as nodeSettings } from '../node';
import { optimization } from '../optimization';
import { plugins } from '../plugins';
import { rules } from '../rules';

const APP_ROOT_DIR = path.resolve(__dirname, '..', '..', '..', '..');

export const node = () => ({
  webpack: (mutableConfig: webpack.Configuration, { stage }: { stage: Stage }) => {
    const resolve = mutableConfig.resolve === undefined ? {} : mutableConfig.resolve;
    mutableConfig.resolve = {
      ...resolve,
      mainFields: ['browser', 'module', 'main'],
      aliasFields: ['browser'],
      extensions: ['.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'],
      alias: {
        ...(resolve.alias === undefined ? {} : resolve.alias),
        console$: path.resolve(__dirname, '..', 'console.js'),
        swimmer$: path.resolve(__dirname, 'swimmer.js'),
      },
    };

    const mod = mutableConfig.module === undefined ? {} : mutableConfig.module;
    mutableConfig.module = {
      ...mod,
      rules: rules({ stage, bundle: 'react-static' }),
      strictExportPresence: false,
    };

    // tslint:disable-next-line:no-object-mutation
    (mutableConfig as any).module.defaultRules = [
      {
        type: 'javascript/auto',
        resolve: {},
      },
      {
        test: /\.json$/i,
        type: 'json',
      },
    ];

    if (stage !== 'node') {
      mutableConfig.optimization = optimization({ stage, bundle: 'react-static' });
    }

    const plugs = mutableConfig.plugins === undefined ? [] : mutableConfig.plugins;
    mutableConfig.plugins = plugs
      .filter(
        (plugin) =>
          plugin.constructor.name !== 'NoEmitOnErrorsPlugin' &&
          plugin.constructor.name !== 'ExtractCssChunksPlugin' &&
          plugin.constructor.name !== 'EnvironmentPlugin',
      )
      .concat(plugins({ stage, bundle: 'react-static' }))
      .concat([
        new InjectManifest({
          swSrc: path.resolve(APP_ROOT_DIR, 'dist', 'workers', 'sw.js'),
        }),
      ]);

    mutableConfig.node = nodeSettings;

    if (stage === 'node') {
      mutableConfig.externals = [
        nodeExternals({
          whitelist: [
            'react-universal-component',
            'webpack-flush-chunks',
            'react-static',
            'react-static/templates',
            'react-static/plugins',
            /.*neo-one.*/,
          ],
        }),
      ];
    }

    return mutableConfig;
  },
  beforeRenderToElement: (App: any, { meta }: any) => {
    // tslint:disable-next-line:no-object-mutation
    meta.styleComponentsSheet = new ServerStyleSheet();

    return (props: any) => (
      <StyleSheetManager sheet={meta.styleComponentsSheet.instance}>
        <App {...props} />
      </StyleSheetManager>
    );
  },

  Head: ({ meta }: any) => <>{meta.styleComponentsSheet.getStyleElement()}</>,
});
