module.exports = {
	options: {
		curly:      true,
		eqeqeq:     true,
		immed:      true,
		latedef:    true,
		newcap:     true,
		noarg:      true,
		sub:        true,
		undef:      true,
		boss:       true,
		eqnull:     true,
		browser:    true,
		devel:      true,
		browserify: true,
		globals:    {
			jQuery:           true,
			Backbone:         false,
			_:                false,
			AdminMenuManager: false,
			ajaxurl:          false,
			wp:               false
		}
	},
	all:     [
		'js/src/**/*.js',
		'js/test/**/*.js'
	]
};
