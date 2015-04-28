/* global _, jQuery, ajaxurl, AdminMenuManager */
/**
 * Admin Menu Manager
 *
 * Copyright (c) 2015 required+
 * Licensed under the GPLv2+ license.
 */

(function ($) {
  'use strict';

  $(function () {
    var isEditing = false;

    // Edit Button
    $('#admin-menu-manager-edit').click(function (e) {
      e.preventDefault();

      var button = $(this).find('.menu-top'),
          buttonLabel = $(this).find('.wp-menu-name'),
          buttonIcon = $(this).find('.wp-menu-image');

    });

  });
}(jQuery));