module.exports = {
	dist: {
		files: {
			'js/admin-menu-manager.js': [ 'js/src/admin-menu-manager.js' ]
		},
		options: {
			transform: [
				'node-underscorify',
				[ 'pkgify', {
					packages: {
						collections: './js/src/collections',
						models: './js/src/models',
						views: './js/src/views',
						templates: './js/src/templates'
					}
				} ]
			],
			plugin: [ 'bundle-collapser/plugin' ],
			browserifyOptions: { "extensions": [ '.html' ] },
		}
	}
}
