module.exports = {
	release:       [
		'release/<%= package.version %>/',
		'release/svn/'
	],
	js:            [
		'!js/*.js',
		'!js/*.min.js',
		'js/*.js.map',
		'!js/*.min.js.map'
	]
};
