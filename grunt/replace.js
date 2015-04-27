module.exports = {
	header    : {
		src         : ['<%= package.name %>.php'],
		overwrite   : true,
		replacements: [{
			from: /\* Version:(\s*?)[\w.-]+$/m,
			to  : '* Version:$1<%= package.version %>'
		}]
	},
	plugin    : {
		src         : ['classes/plugin.php'],
		overwrite   : true,
		replacements: [
			{
				from: /^(\s*?)const(\s+?)VERSION(\s*?)=(\s+?)'[^']+';/m,
				to  : "$1const$2VERSION$3=$4'<%= package.version %>';"
			}
		]
	},
	composer  : {
		src         : ['composer.json'],
		overwrite   : true,
		replacements: [ // "version": "1.0.0",
			{
				from: /^(\s*?)"version":(\s*?)"[^"]+",/m,
				to  : '$1"version":$2"<%= package.version %>",'
			}
		]
	},
	svn_readme: {
		src         : ['release/svn/readme.md'],
		dest        : 'release/svn/readme.txt',
		replacements: [
			{
				from: /^# (.*?)( #+)?$/mg,
				to  : '=== $1 ==='
			},
			{
				from: /^## (.*?)( #+)?$/mg,
				to  : '== $1 =='
			},
			{
				from: /^### (.*?)( #+)?$/mg,
				to  : '= $1 ='
			},
			{
				from: /^Stable tag:(\s*?)[\w.-]+(\s*?)$/mi,
				to  : 'Stable tag:$1<%= package.version %>$2'
			}
		]
	}
}
