module.exports = {
	options: {
		livereload: true
	},

	config: {
		files: 'grunt/watch.js'
	},

	sass: {
		files: ['css/src/*.scss'],
		tasks: ['sass', 'autoprefixer', 'cssmin']
	},

	php: {
		files  : ['**/*.php'],
		tasks  : ['checktextdomain', 'phpunit'],
		options: {
			debounceDelay: 5000
		}
	},

	scripts: {
		files: 'js/src/**/*.*',
		tasks: ['jshint', 'concat', 'uglify', 'clean:js']
	}
}
