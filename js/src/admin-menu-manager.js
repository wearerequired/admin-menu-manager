/**
 * Admin Menu Manager
 *
 * Copyright (c) 2015 required+
 * Licensed under the GPLv2+ license.
 */

// Load required modules
var App = require('views/app');

(function ($) {
	$(function () {
		'use strict';

		// Run Boy Run
		var app = new App();
		app.render();
	});
})(jQuery, Backbone);
