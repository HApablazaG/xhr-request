const path = require('path');

// Set NODE_ENV for development.
process.env.NODE_ENV = 'production';

module.exports = {
  // The entry file for the bundle.
  entry: {
    request: path.join(__dirname, 'src', 'request.js')
  },

  // The bundle file we will get in the result
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].min.js'
  },

  module: {
    // Apply loaders to files that meet given conditions
    rules: [
      {
        test: /\.(js|jsx)?$/,
        include: path.join(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3
                }
              ]
            ]
          }
        }
      }
    ]
  },

  mode: 'production',
  devtool: false
};
