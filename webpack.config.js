const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack');
const OptimizeJsPlugin = require("optimize-js-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ThreadsPlugin = require('threads-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
   function isProduction() {
      return argv.mode === 'production';
   }

   const title = "Portal";
   const entry = "src/main/main.ts";
   const mainFile = "main.js";
   const assetDir = "asset";
   const distDir = "dist";
   const distAssetDir = "asset";
   const baseUrl = ".";

   /*
    * Plugins
    */
   const plugins = [
      new MiniCssExtractPlugin({
         filename: '[name].bundle.css',
         chunkFilename: "[id].css"
      }),
   ];
   if(isProduction()) {
      plugins.push(new CleanWebpackPlugin({
         cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, distDir + '/**/*')],
      }));
   }
   plugins.push(new ThreadsPlugin());
   if(isProduction()) {
      plugins.push(
         new ReplaceInFileWebpackPlugin([{
            dir: distDir,
            files: [mainFile],
            rules: [
               {
                  search: '.worker.js',
                  replace: '.worker.js?' + Date.now()
               },
               {
                  search: '#####datenow#####',
                  replace: Date.now().toString()
               },
            ]
         }]),
         new ReplaceInFileWebpackPlugin([{
            dir: distDir,
            files: ['index.html'],
            rules: [
               {
                  search: mainFile,
                  replace: `${mainFile}?${Date.now()}`
               },
               {
                  search: `<meta name="base" content="${baseUrl}">`,
                  replace: `<meta name="base" content="${baseUrl}">\n
                  <meta http-equiv="cache-control" content="no-cache" />`
               },
            ]
         }]),
         new CopyWebpackPlugin([
            {from: assetDir, to: distAssetDir}
         ]),
      );
   }
   plugins.push(
      new HtmlWebPackPlugin({
         filename: "index.html",
         title: title,
         meta: {
            base: baseUrl,
            viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
         }
      }),
   );
   if(!isProduction()) {
      plugins.push(
         new webpack.HotModuleReplacementPlugin(),
      );
   }

   /*
    * Minimizers
    */
   const minimizers = [
      new OptimizeJsPlugin({}),
      new OptimizeCssAssetsPlugin({
         cssProcessorPluginOptions: {
            preset: ['default', {discardComments: {removeAll: true}}],
         },
      }),
      new TerserPlugin({
         parallel: true,
         terserOptions: {
            keep_classnames: false,
            keep_fnames: false,
            compress: {
               drop_console: true,
            },
            output: {
               comments: false,
            }
         },
         extractComments: false
      })
   ];


   return {
      entry: path.resolve(__dirname, entry),
      watch: !isProduction(),
      output: {
         path: path.resolve(__dirname, distDir),
         filename: mainFile,
         pathinfo: false
      },
      target: "web",
      devServer: {
         port: 8081
      },
      resolve: {
         extensions: [
            '.tsx',
            ...(() => isProduction() ? ['.prod.ts'] : [])(),
            '.ts',
            '.js'
         ]
      },
      devtool: !isProduction() ? 'inline-source-map' : '',
      module: {
         rules: [
            {
               test: /\.css$/,
               use: [
                  'style-loader',
                  'css-loader'
               ]
            },
            {
               test: /\.scss$/,
               use: [
                  "style-loader", // creates style nodes from JS strings
                  "css-loader", // translates CSS into CommonJS
                  "sass-loader" // compiles Sass to CSS, using Node Sass by default
               ]
            },
            {
               test: /\.tsx?$/,
               use: [
                  // Ez először futtatja a ts-loadert a TypeScript típusellenőrzéssel és fordítással,
                  // a js kimenetet kapja a babel-loader, amivel további mikro-optimalizációkat végzünk.
                  {
                     loader: 'babel-loader'
                  },
                  {
                     loader: 'ts-loader',
                     options: {
                        transpileOnly: true, // Disabled due to performance reasons
                        experimentalWatchApi: !isProduction(),
                        compilerOptions: {
                           module: "esnext"
                        },
                        configFile: isProduction() ? 'tsconfig.prod.json' : 'tsconfig.json'
                     },
                  },
               ],
            },
            {
               test: /\.html$/,
               use: [
                  {
                     loader: "html-loader",
                     options: {
                        minimize: true
                     }
                  }
               ]
            },
            {
               test: /\.(png|jpg|jpeg|gif|svg|bin|glb|gltf|woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        name: '[path]/[name].[ext]',
                        outputPath: (url, resourcePath, context) => {
                           if(isProduction()) {
                              return path.relative(context, resourcePath).replace(path.normalize("src/"), "");
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
                     loader: "gltf-webpack-loader"
                  }
               ]
            },
         ]
      },
      optimization: {
         minimize: isProduction(),
         minimizer: minimizers
      },
      plugins: plugins
   };
};
