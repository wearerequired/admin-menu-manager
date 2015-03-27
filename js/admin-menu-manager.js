/* global AdminMenuManager */
"use strict";

(function ($) {

  $(function () {
    var isEditing = false, positions = [];

    $('#admin-menu-manager-edit').click(function () {
      var label = $(this).find('.wp-menu-name');

      isEditing = !isEditing;

      $("#adminmenu, .wp-submenu").sortable({
        disabled   : !isEditing,
        cancel     : "#admin-menu-manager-edit, #collapse-menu",
        connectWith: '.wp-submenu',
        stop       : update_sortable_indexes
      });

      if (isEditing) {
        label.text(AdminMenuManager.buttonSave);
        $('#adminmenu').disableSelection();

        /*$('#adminmenu .wp-has-submenu').click(function (e) {
         e.preventDefault();
         $(this).toggleClass('opensub');
         });*/
      } else {
        label.text(AdminMenuManager.buttonSaving);
        var data = {
          action             : 'amm_update_menu_settings',
          menu_item_positions: positions
        };

        jQuery.post(ajaxurl, data, function (response) {
          label.text(AdminMenuManager.buttonSaved);
          // todo fade!
          label.text(AdminMenuManager.buttonEdit);
        });
      }
    });

    function update_sortable_indexes(event, ui) {
      $('#adminmenu > li:not(#collapse-menu,#admin-menu-manager-edit)').each(function (x) {
        if ($(this).hasClass('wp-menu-separator')) {
          positions[x] = {
            'separator': true
          }
        } else {
          positions[x] = {
            'href'    : $(this).find('a:first-child').attr('href'),
            'children': []
          }

          $(this).find('ul > li > a:first-child').each(function (y) {
            positions[x].children[y] = {
              'href': $(this).attr('href')
            };
          });
        }
      });

      console.log(positions);
    }
  });
}(jQuery));