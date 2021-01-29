const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// production モード以外の場合、変数 enabledSourceMap は true
const enabledSourceMap = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/script/index.js',
  output: {
    filename: 'script/main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  module: {
    rules: [
      {
        // 拡張子 .js の場合
        test: /\.js$/,
        use: [
          {
            // Babel を利用する
            loader: 'babel-loader',
            // Babel のオプションを指定する
            options: {
              presets: [
                // プリセットを指定することで、ES2020 を ES5 に変換
                '@babel/preset-env',
              ],
            },
          },
        ],
      },
      // Pug
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
      {
        // 対象となるファイルの拡張子(sass)
        test: /\.(sa|sc|c)ss$/,
        // Sassファイルの読み込みとコンパイル
        use: [
          // CSSファイルを抽出するように MiniCssExtractPlugin のローダーを指定
          {
            loader: MiniCssExtractPlugin.loader,
          },
          // CSSをバンドルするためのローダー
          {
            loader: 'css-loader',
            options: {
              //URL の解決を無効に
              url: false,
              //  production モードでなければソースマップを有効に
              sourceMap: enabledSourceMap,
              // 0 => no loaders (default);
              // 1 => postcss-loader;
              // 2 => postcss-loader, sass-loader
              importLoaders: 2,
            },
          },
          // PostCSS（autoprefixer）の設定
          {
            loader: 'postcss-loader',
            options: {
              // PostCSS でもソースマップを有効に
              sourceMap: enabledSourceMap,
              postcssOptions: {
                // ベンダープレフィックスを自動付与
                plugins: ['autoprefixer'],
              },
            },
          },
          // Sass を CSS へ変換するローダー
          {
            loader: 'sass-loader',
            options: {
              // dart-sass を優先
              implementation: require('sass'),
              sassOptions: {
                // fibers を使わない場合は以下で false を指定
                fiber: require('fibers'),
              },
              //  production モードでなければソースマップを有効に
              sourceMap: enabledSourceMap,
            },
          },
        ],
      },
    ],
  },
  target: ['web', 'es5'],
  //プラグインの設定
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    ...glob
      .sync('**/*.pug', {
        ignore: '**/_*.pug',
        cwd: path.resolve(__dirname, 'src'),
      })
      .map(function (file) {
        return new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'src', file),
          filename: file.replace(/\.[^/.]+$/, '') + '.html',
        });
      }),
    new MiniCssExtractPlugin({
      // 抽出する CSS のファイル名
      filename: 'style/style.css',
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/image', to: 'image' }],
    }),
  ],
  //source-map タイプのソースマップを出力
  devtool: enabledSourceMap ? 'source-map' : false,
  // node_modules を監視（watch）対象から除外
  watchOptions: {
    ignored: /node_modules/, //正規表現で指定
  },
  devServer: {
    //ルートディレクトリの指定
    contentBase: path.join(__dirname, ''),
    //サーバー起動時にブラウザを自動的に起動
    open: true,
    // ルートディレクトリのファイルを監視（変更があると自動的にリロードされる）
    watchContentBase: true,
    //バンドルされたファイルを出力する（実際に書き出す）
    writeToDisk: true,
  },
};
