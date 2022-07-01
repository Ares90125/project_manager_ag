module.exports = {
	module: {
		rules: [
			{
				test: /\.(js|ts)$/,
				use: {
					loader: 'babel-loader',
					options: {
						plugins: ['babel-plugin-istanbul']
					}
				},
				enforce: 'post',
				include: require('path').join(__dirname, '..', 'src'),
				exclude: [/\.(e2e|spec)\.ts$/, /node_modules/, /(ngfactory|ngstyle)\.js/]
			}
		]
	}
};
