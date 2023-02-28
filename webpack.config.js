const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'eval-source-map',
  devServer: {
    hot: true,
    //默认端口
    port: 5000,
    //自动打开浏览器
    open: true,
    //开启服务端压缩
    compress: true,
    //使用 History 路由模式时，若404错误时被替代为 index.html
    historyApiFallback: true,
  },
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js',
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: '/.js$/',
        exclude: '/node_modules/',
        use: ['babel-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
    }),
  ],
}
