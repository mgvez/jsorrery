var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var fs = require('fs');
var csswring = require('csswring');


module.exports = {
	devtool: 'cheap-module-eval-source-map',
	entry: [
		'webpack-hot-middleware/client',
		'./src/index',
	],

	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, '/dist/'),
		publicPath: '/dist/',
	},

	quiet: false,
	noInfo: false,
	stats: {
		// Config for minimal console.log mess.
		assets: false,
		colors: true,
		version: true,
		hash: false,
		timings: true,
		chunks: false,
		chunkModules: false
	},

	plugins: [
		new webpack.DefinePlugin({
			__DEVELOPMENT__: true
		}),
		new ExtractTextPlugin('bundle.css'),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
		}),
	],

	resolve: {
		extensions: ['', '.js', '.json'],
		modulesDirectories: ['node_modules', 'src'],
		alias: {
			// require('tinymce') will do require('tinymce/tinymce') 
			tinymce: 'tinymce/tinymce',
		},
	},

	module: {
		loaders: [
		{
			test: /\.js$/,
			loaders: ['babel-loader', 'eslint-loader'],
			exclude: /node_modules/,
		},
		// {
		// 	// Only apply on tinymce/tinymce
		// 	include: require.resolve('tinymce/tinymce'),
		// 	// Export window.tinymce
		// 	loader: 'exports?window.tinymce',
	 //    },
		{
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader'
    },
		// {
		// 	test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'url?limit=10000&mimetype=application/font-woff',
		// }, {
		// 	test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'url?limit=10000&mimetype=application/font-woff2',
		// }, {
		// 	test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'url?limit=10000&mimetype=application/octet-stream',
		// }, {
		// 	test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'url?limit=10000&mimetype=application/font-otf',
		// }, {
		// 	test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'file',
		// }, {
		// 	test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
		// 	loader: 'url?limit=10000&mimetype=image/svg+xml',
		// },  
		{
			test: /\.scss$/,
			loader: 'css?localIdentName=[path]!postcss-loader!sass',
		}, {
			test: /\.png$/,
			loader: 'file?name=[name].[ext]',
		}, {
			test: /\.jpg$/,
			loader: 'file?name=[name].[ext]',
		}
		],
	},
	postcss: function() {
		return [autoprefixer({ browsers: ['last 2 versions', 'safari 5', 'ie 9', 'ios 6', 'android 4'] }), csswring];
	},
};
