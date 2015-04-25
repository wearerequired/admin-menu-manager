module.exports = {
	main: {
		options: {
			mode   : 'zip',
			archive: './release/<%= package.name %>.<%= package.version %>.zip'
		},
		expand : true,
		cwd    : 'release/<%= package.version %>/',
		src    : ['**/*'],
		dest   : '<%= package.name %>/'
	}
}
