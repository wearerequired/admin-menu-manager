/*! 1.0.0 */
/* global AdminMenuManager */
"use strict";

(function ($) {

  $(function () {
    var isEditing = false;

    // Edit Button
    $('#admin-menu-manager-edit').click(function (e) {
      e.preventDefault();

      var button = $(this).find('.menu-top'),
          buttonLabel = $(this).find('.wp-menu-name'),
          buttonIcon = $(this).find('.wp-menu-image');

      isEditing = !isEditing;

      if (isEditing) {
        // Add submenu <ul> to all elements so we could add items to every menu if we want
        _.each($('#adminmenu > .menu-top:not(.wp-has-submenu)'), function (el) {
          var $el = $(el);
          $el.addClass('wp-has-submenu');
          if ($el.hasClass('current')) {
            $el.addClass('wp-has-current-submenu');
          }
          $el.append('<ul class="wp-submenu wp-submenu-wrap"><li class="wp-submenu-head">' + $(el).find('.wp-menu-name').html() + '</li></ul>');
        });
      } else {
        // Remove unneccessary classes again from the menu items
        _.each($('#adminmenu > .menu-top.wp-has-submenu'), function (el) {
          var $el = $(el);
          if ($el.find('li').length <= 1) {
            $el.removeClass('wp-has-current-submenu wp-has-submenu');
          }
        });
      }

      $('#adminmenuwrap ul').sortable({
        disabled   : !isEditing,
        cancel     : '#admin-menu-manager-edit, #collapse-menu',
        connectWith: '#adminmenuwrap ul',
        // This event is triggered when (surprise) sortable starts
        create     : function (event, ui) {
          // On init, store each menu item's initial state
          var separatorIndex = 0;

          _.each($('#adminmenu li:not(.wp-submenu-head)'), function (el, index) {
            var $el = $(el);

            $el.attr('data-amm-class', $el.attr('class'));
            $el.attr('data-amm-index', $el.index());

            if ($el.parent('.wp-submenu').length > 0) {
              $el.attr('data-amm-parent', $el.parents('li').find('a').attr('href'));
              $el.attr('data-amm-index', $el.index() - 1);
            }

            // Add this data attribute to separators to make things easier when sorting
            if ($el.hasClass('wp-menu-separator'))
              $el.attr('data-amm-separator', 'separator' + (++separatorIndex));
          });

          $('[data-amm-separator=separator' + separatorIndex + ']').attr('data-amm-separator', 'separator-last');

        },
        // This event is triggered when the user stopped sorting and the DOM position has changed.
        update     : changeMenu,
        beforeStop : function (event, ui) {
          // return false if this is an element that shouldn't be dragged to a specific location
        },
        change     : function (event, ui) {
          // show the submenu items of an element close to the current item so we could move it there

          // Items can't be moved after the collapse and edit buttons
          var $fixed = $('#admin-menu-manager-edit, #collapse-menu', this).detach();
          $(this).append($fixed);
        }
      });

      if (isEditing) {
        buttonIcon.removeClass('dashicons-edit').addClass('dashicons-yes');
        buttonLabel.text(AdminMenuManager.buttonSave);
        button.attr('title', AdminMenuManager.buttonSave);
      } else {
        var data = {
          action   : 'amm_update_menu',
          adminMenu: AdminMenuManager.adminMenu
        };

        $.post(ajaxurl, data, function () {
          buttonIcon.removeClass('dashicons-yes').addClass('dashicons-edit');
          buttonLabel.text(AdminMenuManager.buttonSaving).fadeOut(1000, function () {
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

      /**
       * Iterate through the admin menu object.
       *
       * Find the item's last position and move it to the new one.
       */
      _.find(AdminMenuManager.adminMenu, function (value, index) {
        // Acommodate for different structures
        var isSame = ( value[2] && itemHref && value[2] == itemHref );
        if (!isSame && value[2].indexOf('.') == -1 && value[2] && itemHref)
          isSame = 'admin.php?page=' + value[2] == itemHref;

        if (
            isSame
            || ( isSeparator && value[4] == 'wp-menu-separator' && value[2] == separator )
        ) {
          oldItem = [index];
          return true;
        }

        _.find(value[7], function (v, k) {
          // Acommodate for different structures
          var isSame = ( v[2] && itemHref && v[2] == itemHref );
          if (!isSame && v[2].indexOf('.') == -1 && v[2] && itemHref)
            isSame = 'admin.php?page=' + v[2] == itemHref || this.parent[2] + '?page=' + v[2] == itemHref;

          if (
              isSame
              || ( isSeparator && v[4] == 'wp-menu-separator' && v[2] == separator )
          ) {
            oldItem = [index, k];
            return true;
          }
        }, {parent: value});
      });

      // Get the item object from the old position
      if (oldItem) {
        var oldIcon = AdminMenuManager.adminMenu[oldItem[0]][6];

        if (oldItem.length == 1) {
          var item = AdminMenuManager.adminMenu[oldItem[0]];
          AdminMenuManager.adminMenu.splice(oldItem[0], 1);
        } else if (oldItem.length == 2) {
          var item = AdminMenuManager.adminMenu[oldItem[0]][7][oldItem[1]];
          AdminMenuManager.adminMenu[oldItem[0]][7].splice(oldItem[1], 1);
        }
      }

      // Move it to the new position. Add icon if not existing
      if (currentPosition.length == 1) {
        if (!isSeparator)
          item[4] = 'menu-top';

        // Copy from the parent item if available
        item[5] = item[5] ? item[5] : (!!oldItem ? AdminMenuManager.adminMenu[oldItem[0]][5] : '');
        item[6] = oldIcon ? oldIcon : 'dashicons-admin-generic';
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

      // Was this item moved to the top level?
      if (ui.item.parent('#adminmenu').length > 0) {
        // Is this a separator or not?
        if (!isSeparator) {
          // Is this originally a top level item or not?
          if (!ui.item.attr('data-amm-parent')) {
            ui.item.removeClass().addClass(ui.item.attr('data-amm-class')).addClass('ui-sortable-handle');
          } else {
            ui.item.addClass('menu-top');
            ui.item.find('a').addClass('menu-top');
          }

          ui.item.addClass(item[5]);
          ui.item.find('.amm-wp-menu-name').removeClass('amm-wp-menu-name').addClass('wp-menu-name');

          // Item doesn't yet have the structure that is needed for a top level item
          if (ui.item.find('a div').length == 0) {
            ui.item.find('a').wrapInner('<div class="wp-menu-name"></div>');

            // Add the menu icon depending on context (dashicon/svg/div)
            if (item[6].indexOf('dashicons') > -1) {
              ui.item.find('a').prepend('<div class="wp-menu-image dashicons-before ' + item[6] + '"><br></div>');
            } else if (item[6].indexOf('image/svg') > -1 || item[6].indexOf('http') > -1) {
              ui.item.find('a').prepend('<div class="wp-menu-image svg" style="background-image:url(' + item[6] + ') !important;"><br></div>');
            } else if ('div' == item[6] || 'none' == item[6]) {
              ui.item.find('a').prepend('<div class="wp-menu-image dashicons-before"><br></div>');
            } else {
              ui.item.find('a').prepend('<div class="wp-menu-image dashicons-before dashicons-admin-generic"><br></div>');
            }
          }

          // Showtime!
          ui.item.find('.wp-menu-arrow').removeClass('hidden');
          ui.item.find('.wp-menu-image').removeClass('hidden');
          ui.item.find('.wp-submenu').removeClass('hidden');
        }
      } else {
        // Submenu item, hide stuff that isn't needed
        ui.item.removeClass('menu-top').removeClass(ui.item.attr("class").match(/toplevel_[\w-]*\b/));
        ui.item.find('.menu-top').removeClass('menu-top');
        ui.item.find('.wp-menu-arrow').addClass('hidden');
        ui.item.find('.wp-menu-image').addClass('hidden');
        ui.item.find('.wp-submenu').addClass('hidden');
        if (ui.item.find('.wp-menu-name').length > 0) {
          ui.item.find('.wp-menu-name').removeClass('wp-menu-name').addClass('amm-wp-menu-name');
        }
      }
    }
  });
}(jQuery));