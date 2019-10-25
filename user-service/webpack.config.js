const path = require('path')
const slsw = require('serverless-webpack')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  performance: {
    // Turn off size warnings for entry points
    hints: false
  },
  devtool: slsw.lib.webpack.isLocal ? 'source-map' : 'nosources-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true,
              plugins: ['source-map-support'],
              presets: [
                [
                  '@babel/preset-env',
                  // commonjs setting here required to avoid https://github.com/webpack/webpack/issues/4039
                  { modules: 'commonjs', targets: { node: true } }
                ]
              ]
            }
          }
        ]
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  }
}
