module.exports = {
	options: {
		livereload: true
	},

	config: {
		files: 'grunt/watch.js'
	},

	sass: {
		files: [ 'css/src/*.scss' ],
		tasks: [ 'sass', 'postcss' ]
	},

	scripts: {
		files: 'js/src/**/*.*',
		tasks: [ 'jshint', 'browserify', 'uglify' ]
	}
};
