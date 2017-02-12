import path from 'path';

import 'babel-polyfill';
import { identity } from 'lodash';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';


export default (env) => {
  const isProd = env === 'production';

  return {
    entry: {
      head: [
        path.resolve(__dirname, 'src', 'app', 'head.ts'),
      ],
      vendor: [
        'angular',
      ],
      bundle: [
        path.resolve(__dirname, 'src', 'app', 'index.ts'),
      ],
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `[name]-[${isProd ? 'contenthash' : 'hash'}:6].js`,
      publicPath: '/statics/',
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          include: [
            path.resolve(__dirname, 'src'),
          ],
          enforce: 'pre',
          loader: 'tslint-loader',
        },
        {
          test: /\.ts$/,
          include: [
            path.resolve(__dirname, 'src'),
          ],
          loader: 'ts-loader',
        },
        {
          test: /\.scss$/,
          include: [
            path.resolve(__dirname, 'src'),
          ],
          loader: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins() {
                    return [
                      autoprefixer({ browsers: ['last 2 versions'] }),
                    ];
                  },
                },
              },
              {
                loader: 'sass-loader',
              },
            ],
          }),
        },
        {
          test: /\.(?:svg|png|jpg)$/,
          include: [
            path.resolve(__dirname, 'src'),
          ],
          loader: 'url-loader',
          options: {
            limit: 5120,
            name: '[name]-[hash:6].[ext]',
          },
        },
      ],
    },

    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, 'src'),
      ],

      extensions: [
        '.ts',
        '.js',
        '.json',
      ],
    },

    devtool: isProd ? 'source-map' : 'inline-source-map',

    context: __dirname,

    target: 'web',

    externals: [],

    plugins: [
      new CleanWebpackPlugin(['dist'], {
        root: __dirname,
        verbose: true,
        dry: false,
        exclude: ['.gitignore'],
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      !isProd && new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime',
        chunks: ['vendor'],
        minChunks: Infinity,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['bundle'],
        minChunks(module) {
          return module.context && module.context.includes('node_modules');
        },
      }),
      new ExtractTextPlugin({
        filename: '[name]-[hash:6].css',
        allChunks: true,
      }),
      new ManifestPlugin({
        fileName: 'webpack-manifest.json',
      }),
      new HtmlPlugin({
        title: 'Angular Scaffold',
        template: 'src/app/index.html.ejs',
      }),
      isProd && new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false,
        },
      }),
    ].filter(identity),

    stats: {
      children: false,
    },
  };
};
