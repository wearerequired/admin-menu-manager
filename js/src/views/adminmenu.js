var EditButtonView = require('views/edit-button');
var MenuItem = require('models/menu-item');
var MenuItemView = require('views/menu-item');

var AdminMenu = Backbone.View.extend({
	el       : '#adminmenuwrap',
	tagName  : 'div',
	className: 'amm-adminmenu-view',
	isEditing: false,

	initialize: function () {
		this.editButton = new EditButtonView();

		// Initialize menu items

		var Menu = Backbone.Collection.extend({
			model: MenuItem,
		});

		this.menu = new Menu();

		var count = 0;
		_.each(AdminMenuManager.menu, function (el) {
			var menuItem = new MenuItem(el),
					$el = this.$el.find('#adminmenu > li');

			menuItem.set(4, $el.get(count).className);
			menuItem.set('class', el[4]);
			menuItem.set('children', new Menu());

			// Add current class if applicable
			if (jQuery($el.get(count)).hasClass('current') || jQuery($el.get(count)).hasClass('wp-has-current-submenu')) {
				menuItem.set('current', true);
			}

			if (el[2].indexOf('.php') === -1) {
				menuItem.set('href', 'admin.php?page=' + el[2]);
			}

			this.menu.add(menuItem);

			if (AdminMenuManager.submenu[menuItem.get(2)]) {
				var subCount = 0;
				_.each(AdminMenuManager.submenu[menuItem.get(2)], function (el) {
					var $el = jQuery(this.$el.find('#adminmenu > li')[count]).find('li:not(.wp-submenu-head)');

					var submenuItem = new MenuItem(el);

					// Add current class if applicable
					if (jQuery($el.get(subCount)).hasClass('current')) {
						submenuItem.set('current', true);
					}

					if (el[2].indexOf('.php') === -1) {
						submenuItem.set('href', 'admin.php?page=' + el[2]);
					}

					submenuItem.set(5, menuItem.get(5));
					submenuItem.set(6, menuItem.get(6));
					submenuItem.set('class', menuItem.get(4));

					menuItem.attributes.children.add(submenuItem);

					subCount++;
				}, this);
			}

			count++;
		}, this);

		// Allow for undo/redo
		this.undoManager = new Backbone.UndoManager({
			register: [this.menu],
			track   : true
		});

		this.listenTo(this.editButton, 'undo', function () {
			this.undoManager.undo(true);
			this.render();
			this.editButton.initEditing();
		});

		this.listenTo(this.editButton, 'redo', function () {
			this.undoManager.redo(true);
			this.render();
			this.editButton.initEditing();
		});

	},

	render: function () {
		var $adminMenu = this.$el.find('#adminmenu'),
				collapse = this.$el.find('#collapse-menu').detach();

		$adminMenu.empty();

		_.each(this.menu.models, function (item) {
			// Re-render the current item
			var menuItemView = new MenuItemView({model: item});
			$adminMenu.append(menuItemView.render().$el);
		}, this);

		// Append collapse and edit button
		$adminMenu.append(collapse).append(this.editButton.render().el);

		// Re-bind hoverIntent
		this.hoverIntent();

		this.initSortable(this.isEditing);

		// Add listeners
		this.listenTo(this.editButton, 'isActive', this.toggleSortable);

		return this;
	},

	initSortable: function (isEditing) {
		// Initialize sortable
		this.$el.find('ul').sortable({
			disabled   : !isEditing,
			cancel     : '#admin-menu-manager-edit, #collapse-menu, li.wp-first-item',
			connectWith: '#adminmenuwrap ul',
			// This event is triggered when the user stopped sorting and the DOM position has changed.
			update     : jQuery.proxy(this.sortableUpdate, this),
			change     : jQuery.proxy(this.sortableChange, this)
		}).sortable('refresh');

		if (!isEditing) {
			// somehow it doesn't apply this class even if it's initially disabled
			this.$el.find('ul').addClass('ui-sortable-disabled');
		}
	},

	toggleSortable: function (isActive) {
		this.isEditing = isActive;
		this.initSortable(isActive);
	},

	sortableUpdate: function (e, ui) {
		var itemSlug = ui.item.attr('data-slug'),
				newPosition = [ui.item.index()];

		// It's a submenu item
		if (ui.item.parent('.wp-submenu').length > 0) {
			newPosition[0] = newPosition[0] > 0 ? --newPosition[0] : 0;
			var parentPosition = jQuery('#adminmenu > li').index(ui.item.parents('li'));
			newPosition.unshift(parentPosition);
		}

		/**
		 * Iterate through the admin menu object.
		 *
		 * Find the item's last position and move it to the new one.
		 */

		// Iterate on menu items
		var item = this.findInMenu(itemSlug, this.menu);

		if (item === undefined) {
			console.log('item with slug ' + itemSlug + ' not found');
			return;
		}

		// Get the item object from the old position
		item.collection.remove(item);

		// Move it to the new position
		if (newPosition.length === 1) {
			this.menu.add(item, {at: newPosition[0]});

			var _4 = item.get(4);
			if (_4 === '' || _4 === 'current') {
				item.set(4, item.get('class'));
				item.set('class', _4);
			}
		} else if (newPosition.length === 2) {
			this.menu.at(newPosition[0]).collection.add(item, {at: newPosition[1]});
		}

		this.render();
	},

	sortableChange: function (e, ui) {
		// todo: show the submenu items of an element close to the current item so we could move it there

		// Items can't be moved after the collapse and edit buttons
		var $fixed = this.$el.find('#admin-menu-manager-edit, #collapse-menu').detach();
		this.$el.find('#adminmenu').append($fixed);
	},

	findInMenu: function (itemSlug, collection) {
		var result;

		collection.find(function (menuItem) {
			// Accommodate for different structures
			if (menuItem.get(2) && itemSlug && menuItem.get(2) === itemSlug) {
				result = menuItem;
				return true;
			}

			if (menuItem.get('children').length === 0) {
				return false;
			}

			// Loop through sub menu items
			var item = this.findInMenu(itemSlug, menuItem.get('children'));
			if (item !== undefined) {
				result = item;
				return true;
			}

		}, this);

		return result;
	},

	hoverIntent: function () {
		var $adminmenu = this.$el.find('#adminmenu');
		$adminmenu.find('li.wp-has-submenu').hoverIntent({
			over       : function () {
				var $menuItem = jQuery(this),
						$submenu = $menuItem.find('.wp-submenu'),
						top = parseInt($submenu.css('top'), 10);

				if (isNaN(top) || top > -5) { // the submenu is visible
					return;
				}

				if ($adminmenu.data('wp-responsive')) {
					// The menu is in responsive mode, bail
					return;
				}

				adjustSubmenu($menuItem);
				$adminmenu.find('li.opensub').removeClass('opensub');
				$menuItem.addClass('opensub');
			},
			out        : function () {
				if ($adminmenu.data('wp-responsive')) {
					// The menu is in responsive mode, bail
					return;
				}

				jQuery(this).removeClass('opensub').find('.wp-submenu').css('margin-top', '');
			},
			timeout    : 200,
			sensitivity: 7,
			interval   : 90
		});

		/**
		 * Ensure an admin submenu is within the visual viewport.
		 *
		 * @see WordPres 4.1.0
		 *
		 * @param {jQuery} $menuItem The parent menu item containing the submenu.
		 */
		function adjustSubmenu($menuItem) {
			var bottomOffset, pageHeight, adjustment, theFold, menutop, wintop, maxtop,
					$submenu = $menuItem.find('.wp-submenu'),
					$window = jQuery(window),
					$wpwrap = jQuery('#wpwrap');

			menutop = $menuItem.offset().top;
			wintop = $window.scrollTop();
			maxtop = menutop - wintop - 30; // max = make the top of the sub almost touch admin bar

			bottomOffset = menutop + $submenu.height() + 1; // Bottom offset of the menu
			pageHeight = $wpwrap.height(); // Height of the entire page
			adjustment = 60 + bottomOffset - pageHeight;
			theFold = $window.height() + wintop - 50; // The fold

			if (theFold < ( bottomOffset - adjustment )) {
				adjustment = bottomOffset - theFold;
			}

			if (adjustment > maxtop) {
				adjustment = maxtop;
			}

			if (adjustment > 1) {
				$submenu.css('margin-top', '-' + adjustment + 'px');
			} else {
				$submenu.css('margin-top', '');
			}
		}
	}
});

module.exports = AdminMenu;
