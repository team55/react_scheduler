const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const path = require('path');
//http://asyncee.github.io/2016/04/07/nastrojka-webpack-dlya-raboty-s-react-i-scss/

module.exports = {
    // entry: './src/index.jsx',
    //ES8 async/await functions
    entry: ['babel-polyfill','./src/index.jsx'],
    // entry: {
    //     bundle: './static/app.js',
    //     styles: './static/main.scss'
    // },
  amd: true,
  output: {
    filename: './public/bundle.js',
    // library: ["MyLibrary", "[name]"],
    library:"ascheduler",
    libraryTarget: "umd"
  }, module: {
        // plugins: [
        //    new webpack.optimize.ModuleConcatenationPlugin(),
        // ],
    
        loaders: [
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            },
            // {
            //     test: /\.scss$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: 'style-loader',
            //         use: ['css-loader', 'sass-loader']
            //     })
            //
            // },
            {test: /\.css$/,  loader: 'style-loader!css-loader'},

            //{ test: /\.js$/, loader: "babel-generator" }
          {
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
            //env включает в себя es2015, es2016, es2017, latest  
            // Stage 0 - Strawman: just an idea, possible Babel plugin. Spread synt 
            // Stage 1 - Proposal: this is worth working on.
            // Stage 2 - Draft: initial spec. СТРЕЛОЧНЫЕ ФУНКЦИИ
            // Stage 3 - Candidate: complete spec and initial browser implementations. (Spread)
            // Stage 4 - Finished: will be added to the next yearly release.
            //, 'stage-0', 'stage-1', 'stage-3'
              presets: ['env', 'react', 'stage-0', 'stage-1','stage-2','stage-3']
            }
          }
         
        ]
        // ,
        // rules: [{
        //     test: /\.scss$/,
        //     use: [{
        //         loader: "style-loader" // creates style nodes from JS strings
        //     }, {
        //         loader: "css-loader" // translates CSS into CommonJS
        //     }, {
        //         loader: "sass-loader" // compiles Sass to CSS
        //     }]
        // }]

  },
  plugins: [
      new ExtractTextPlugin('./src/style.css')
  ]

}
//