var collapse = require('bundle-collapser/plugin');
var remapify = require('remapify');

module.exports = {
	dist: {
		files  : {
			'js/admin-menu-manager.js': ['js/src/admin-menu-manager.js']
		},
		options: {
			transform        : ['node-underscorify'],
			plugin           : [collapse],
			browserifyOptions: {"extensions": ['.html']},
			preBundleCB      : function (b) {
				b.plugin(remapify, [
					{
						cwd   : './js/src/collections',
						src   : '**/*.js',
						expose: 'collections'
					},
					{
						cwd   : './js/src/models',
						src   : '**/*.js',
						expose: 'models'
					},
					{
						cwd   : './js/src/views',
						src   : '**/*.js',
						expose: 'views'
					},
					{
						cwd   : './js/src/templates',
						src   : '**/*.html',
						expose: 'templates'
					}
				]);
			}
		}
	}
}
