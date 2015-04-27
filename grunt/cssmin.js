module.exports = {
	options: {
		banner             : '/*! <%= package.title %> - v<%= package.version %>\n' +
		' * <%= package.homepage %>\n' +
		' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
		' * Licensed GPLv2+' +
		' */\n',
		keepSpecialComments: 0,
		report             : 'gzip',
		sourceMap          : true
	},
	dist   : {
		expand: true,
		cwd   : 'css/',
		src   : ['*.css', '!*.min.css'],
		dest  : 'css/',
		ext   : '.min.css'
	}
}
