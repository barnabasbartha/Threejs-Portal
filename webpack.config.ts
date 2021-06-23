import * as path from 'path';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import * as webpack from 'webpack';
import {Configuration, HotModuleReplacementPlugin} from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// @ts-ignore
import ReplaceInFileWebpackPlugin from 'replace-in-file-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// @ts-ignore
import ThreadsPlugin from 'threads-plugin';

interface Target {
   readonly entry: string;
   readonly distDir: string;
   readonly output: string;
   readonly target: 'web' | 'node';
   readonly title?: string;
   readonly assetDir?: string;
   readonly distAssetDir?: string;
   readonly baseUrl?: string;
}

const target: Target = {
   entry: 'src/main/main.ts',
   distDir: 'dist',
   output: 'main.js',
   target: 'web',
   title: 'Portal',
   assetDir: 'asset',
   distAssetDir: 'asset',
   baseUrl: '.',
};

module.exports = (env: string, argv: { [key: string]: string }): Configuration => {
   function isProd(): boolean {
      return argv.mode === 'production';
   }

   console.log('Entry: ', path.resolve(__dirname, target.entry));
   console.log('Output path: ', path.resolve(__dirname, target.distDir));

   /*
    * Plugins
    */
   const plugins = [
      new MiniCssExtractPlugin({
         filename: '[name].bundle.css',
         chunkFilename: '[id].css',
      }),
   ];
   if (isProd()) {
      plugins.push(
         new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, target.distDir + '/**/*')],
         }),
      );
   }
   plugins.push(
      new ThreadsPlugin({
         globalObject: 'self',
      }),
   );
   if (isProd()) {
      plugins.push(
         new ReplaceInFileWebpackPlugin([
            {
               dir: target.distDir,
               files: [target.output],
               rules: [
                  {
                     search: '.worker.js',
                     replace: '.worker.js?' + Date.now(),
                  },
                  {
                     search: '#####datenow#####',
                     replace: Date.now().toString(),
                  },
               ],
            },
         ]),
         new ReplaceInFileWebpackPlugin([
            {
               dir: target.distDir,
               files: ['index.html'],
               rules: [
                  {
                     search: target.output,
                     replace: `${target.output}?${Date.now()}`,
                  },
                  {
                     search: `<meta name='base' content='${target.baseUrl}'>`,
                     replace: `<meta name='base' content='${target.baseUrl}'>\n
                  <meta http-equiv='cache-control' content='no-cache' />`,
                  },
               ],
            },
         ]),
         new CopyWebpackPlugin({patterns: [{from: target.assetDir, to: target.distAssetDir}]}),
      );
   } else {
      plugins.push(new HotModuleReplacementPlugin());
   }
   plugins.push(
      new HtmlWebPackPlugin({
         filename: 'index.html',
         title: target.title,
         meta: {
            base: '/',
            viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
         },
      }),
   );

   /*
    * Minimizers
    */
   const minimizers: unknown[] = [
      new OptimizeCssAssetsPlugin({
         cssProcessorPluginOptions: {
            preset: ['default', {discardComments: {removeAll: true}}],
         },
      }),
   ];

   if (isProd() && target.target === 'web') {
      minimizers.push(
         new TerserPlugin({
            parallel: false,
            terserOptions: {
               ecma: 2015,
               keep_classnames: false,
               keep_fnames: false,
               compress: {
                  drop_console: true,
               },
            },
         }),
      );
   }

   return {
      entry: path.resolve(__dirname, target.entry),
      watch: !isProd(),
      output: {
         path: path.resolve(__dirname, target.distDir),
         filename: target.output,
         pathinfo: false,
      },
      target: target.target,
      externals: [],
      resolve: {
         extensions: [
            '.tsx',
            ...(() => (isProd() ? ['.prod.ts'] : []))(), // This will override dev config with prod
            '.ts',
            '.js',
         ],
      },
      devtool: !isProd() ? 'inline-source-map' : false,
      module: {
         rules: [
            {
               test: /\.css$/,
               use: ['style-loader', 'css-loader'],
            },
            {
               test: /\.scss$/,
               use: [
                  'style-loader',
                  'css-loader',
                  'sass-loader',
               ],
            },
            {
               test: /\.tsx?$/,
               use: [
                  {
                     loader: 'babel-loader',
                  },
                  {
                     loader: 'ts-loader',
                     options: {
                        transpileOnly: true, // Disabled due to performance reasons
                        experimentalWatchApi: !isProd(),
                        compilerOptions: {
                           module: 'esnext',
                        },
                     },
                  },
               ],
            },
            {
               test: /\.html$/,
               use: [
                  {
                     loader: 'html-loader',
                     options: {
                        minimize: true,
                     },
                  },
               ],
            },
            {
               test: /\.(png|jpg|jpeg|gif|svg|bin|glb|gltf|woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        name: '[path]/[name].[ext]',
                        outputPath: (url: string, resourcePath: string, context: string) => {
                           if (isProd()) {
                              // Remove "src/" from asset imports in prod. It is necessary only locally
                              return path.relative(context, resourcePath).replace(path.normalize('src/'), '');
                           } else {
                              return url;
                           }
                        },
                     },
                  },
               ],
            },
            {
               test: /\.(gltf)$/,
               use: [
                  {
                     loader: 'gltf-webpack-loader',
                  },
               ],
            },
         ],
      },
      optimization: {
         minimize: isProd(),
         minimizer: minimizers as webpack.Plugin[],
      },
      plugins: plugins,
   };
};
