module.exports = {
	header: {
		src:          [ '<%= package.name %>.php' ],
		overwrite:    true,
		replacements: [ {
			from: /\* Version:(\s*?)[\w.-]+$/m,
			to:   '* Version:$1<%= package.version %>'
		} ]
	},
	plugin: {
		src:          [ 'classes/Controller.php' ],
		overwrite:    true,
		replacements: [
			{
				from: /^(\s*?)const(\s+?)VERSION(\s*?)=(\s+?)'[^']+';/m,
				to:   "$1const$2VERSION$3=$4'<%= package.version %>';"
			}
		]
	}
};
