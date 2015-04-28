/**
 * Admin Menu Manager
 *
 * Copyright (c) 2015 required+
 * Licensed under the GPLv2+ license.
 */

// Load required modules
var AppModel = require('models/main');
var appModel = new AppModel();
var AppView = require('views/app');

(function ($) {
  $(function () {
    'use strict';

    // Run Boy Run
    var appView = new AppView({model: appModel});
    appView.render();
  });
})(jQuery);