module.exports = {
	options: {
		// or
		map: {
			inline: false, // save all sourcemaps as separate files...
			annotation: 'css/' // ...to the specified directory
		},

		processors: [
			require( 'autoprefixer-core' )( {
				browsers: [
					'last 2 versions',
					'> 5%',
					'ie 9'
				]
			} ), // add vendor prefixes
			require( 'cssnano' )() // minify the result
		]
	},
	dist: {
		src: 'css/admin-menu-manager.css',
		dest: 'css/admin-menu-manager.min.css'
	}
}
