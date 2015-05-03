/**
 * Admin Menu Manager
 *
 * Copyright (c) 2015 required+
 * Licensed under the GPLv2+ license.
 */

// Load required modules
var AppView = require('views/app');

(function ($) {
	$(function () {
		'use strict';

		// Run Boy Run
		var appView = new AppView();
		appView.render();
	});
})(jQuery);
