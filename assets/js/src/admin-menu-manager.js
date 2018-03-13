/**
 * Admin Menu Manager
 *
 * Copyright (c) 2015 required
 * Licensed under the GPLv2+ license.
 */
import App from './views/app';

( function( $ ) {
	$( function() {
		'use strict';

		// Run Boy Run
		const app = new App();
		app.render();
	});
}( jQuery, Backbone ) );
