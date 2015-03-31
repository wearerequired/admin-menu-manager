/*! 1.0.0 */
/* global AdminMenuManager */
"use strict";

(function ($) {

  $(function () {
    var isEditing = false, separatorIndex = 0;

    // On init, store each menu item's initial state
    $('#adminmenu li:not(.wp-submenu-head)').each(function (index) {
      $(this).attr('data-amm-class', $(this).attr('class'));
      $(this).attr('data-amm-index', index);
      if (!$(this).hasClass('menu-top'))
        $(this).attr('data-amm-parent', $(this).parents('li').find('a').attr('href'));

      // Add this data attribute to separators to make things easier when sorting
      if ($(this).hasClass('wp-menu-separator'))
        $(this).attr('data-amm-separator', 'separator' + (++separatorIndex));
    });

    // Not sure if this is working properly...
    if (separatorIndex > 2)
      $('[data-amm-separator=separator' + separatorIndex + ']').attr('data-amm-separator', 'separator-last');

    // Edit Button
    $('#admin-menu-manager-edit').click(function (e) {
      e.preventDefault();

      var label = $(this).find('.wp-menu-name');

      isEditing = !isEditing;

      if (isEditing) {
        // Add submenu <ul> to all elements so we could add items to every menu if we want
        _.each($('#adminmenu > .menu-top:not(.wp-has-submenu)'), function (el) {
          $(el).addClass('wp-has-submenu');
          if ($(el).hasClass('current')) {
            $(el).addClass('wp-has-current-submenu');
          }
          $(el).append('<ul class="wp-submenu wp-submenu-wrap"><li class="wp-submenu-head">' + $(el).find('.wp-menu-name').html() + '</li></ul>');
        });
      } else {
        // Remove unneccessary classes again from the menu items
        _.each($('#adminmenu > .menu-top.wp-has-submenu'), function (el) {
          if ($(el).find('li').length <= 1) {
            $(el).removeClass('wp-has-current-submenu wp-has-submenu');
          }
        });
      }

      $('#adminmenuwrap ul').sortable({
        disabled   : !isEditing,
        cancel     : '#admin-menu-manager-edit, #collapse-menu',
        connectWith: '#adminmenuwrap ul',
        // This event is triggered when the user stopped sorting and the DOM position has changed.
        update     : changeMenu,
        beforeStop : function (event, ui) {
          // return false if this is an element that shouldn't be dragged to a specific location
        },
        change     : function (event, ui) {
          // show the submenu items of an element close to the current item so we could move it there
        }
      });

      if (isEditing) {
        label.text(AdminMenuManager.buttonSave);
      } else {
        var data = {
          action   : 'amm_update_menu',
          adminMenu: AdminMenuManager.adminMenu
        };

        $.post(ajaxurl, data, function () {
          label.text(AdminMenuManager.buttonSaving).fadeOut(1000, function () {
            $(this).text(AdminMenuManager.buttonSaved)
                .fadeIn()
                .delay(1000)
                .fadeOut(50, function () {
                  $(this).text(AdminMenuManager.buttonEdit).fadeIn(50);
                });
          });
        });
      }
    });

    function changeMenu(e, ui) {
      var itemHref = ui.item.find('a').attr('href'),
          newPosition = ui.item.index(),
          isSeparator = ui.item.is('.wp-menu-separator'),
          separator = ui.item.attr('data-amm-separator'),
          currentPosition = [ui.item.index()],
          oldItem;

      if (itemHref) {
        itemHref = itemHref.replace('jetpack_modules', 'jetpack');
      }

      // It's a submenu item
      if (ui.item.parent('.wp-submenu').length > 0) {
        newPosition = newPosition > 0 ? --newPosition : 0;
        var parentPosition = $('#adminmenu > li').index(ui.item.parents('li'));
        currentPosition = [parentPosition, newPosition]
      }

      // Add CSS classes
      if (ui.item.index() > 0) {
        ui.item.removeClass('wp-first-item');
      }

      // Was this item moved to the top level?
      if (ui.item.parent('#adminmenu').length) {
        // Is this a separator or not?
        if (!isSeparator) {
          // Is this originally a top level item or not?
          if (!ui.item.attr('data-amm-parent')) {
            ui.item.removeClass().addClass(ui.item.attr('data-amm-class')).addClass('ui-sortable-handle');
            ui.item.find('.amm-wp-menu-name').removeClass('amm-wp-menu-name').addClass('wp-menu-name');
          } else {
            ui.item.addClass('menu-top');
            ui.item.find('a').addClass('menu-top');
          }

          // Item doesn't yet have the structure that is needed for a top level item
          if (ui.item.find('a div').length == 0) {
            ui.item.find('a').wrapInner('<div class="wp-menu-name"></div>');
            ui.item.find('a').prepend('<div class="wp-menu-image dashicons-before dashicons-admin-generic"><br></div>');
          }

          // Showtime!
          ui.item.find('.wp-menu-arrow').show();
          ui.item.find('.wp-menu-image').show();
          ui.item.find('.wp-submenu').show();
        }
      } else {
        // Submenu item, hide stuff that isn't needed
        ui.item.removeClass('menu-top');
        ui.item.find('.menu-top').removeClass('menu-top');
        ui.item.find('.wp-menu-arrow').hide();
        ui.item.find('.wp-menu-image').hide();
        ui.item.find('.wp-submenu').hide();
        if (ui.item.find('.wp-menu-name').length > 0) {
          ui.item.find('.wp-menu-name').removeClass('wp-menu-name').addClass('amm-wp-menu-name');
        }
      }

      /**
       * Iterate through the admin menu object.
       *
       * Find the item's last position and move it to the new one.
       */
      _.each(AdminMenuManager.adminMenu, function (value, index) {
        if (
            ( value[2] && itemHref && value[2] == itemHref.split('=')[1] )
            || ( isSeparator && value[4] == 'wp-menu-separator' && value[2] == separator )) {
          oldItem = [index];
          return false;
        }

        _.each(value[7], function (v, k) {
          if (
              ( v[2] && itemHref && v[2] == itemHref.split('=')[1] )
              || ( isSeparator && value[4] == 'wp-menu-separator' && value[2] == separator )) {
            oldItem = [index, k];
            return false;
          }
        }, {ui: this.ui});
      }, {ui: ui});

      // Get the item object from the old position
      if (oldItem && oldItem.length == 1) {
        var item = AdminMenuManager.adminMenu[oldItem[0]];
        AdminMenuManager.adminMenu.splice(oldItem[0], 1);
      } else if (oldItem && oldItem.length == 2) {
        var item = AdminMenuManager.adminMenu[oldItem[0]][7][oldItem[1]];
        AdminMenuManager.adminMenu[oldItem[0]][7].splice(oldItem[1], 1);
      }

      // Move it to the new position. Add icon if not existing
      if (currentPosition.length == 1) {
        if (item.length == 4) {
          item[4] = 'menu-top';
          item[5] = '';
          item[6] = 'dashicons-admin-generic';
        }
        AdminMenuManager.adminMenu.splice(currentPosition[0], 0, item);
      } else if (currentPosition.length == 2) {
        item[4] = '';

        if (AdminMenuManager.adminMenu[currentPosition[0]][7].length > 0) {
          AdminMenuManager.adminMenu[currentPosition[0]][7].splice(currentPosition[1], 0, item);
        } else {
          // This means the menu item hasn't had any children before.
          AdminMenuManager.adminMenu[currentPosition[0]][7].push(item);
        }
      }
    }
  });
}(jQuery));