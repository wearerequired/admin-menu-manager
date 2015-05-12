var EditButtonView = require('views/edit-button'),
		TrashView = require('views/trash'),
		MenuItem = require('models/menu-item'),
		MenuItemView = require('views/menu-item');

var Menu = Backbone.Collection.extend({
	model: MenuItem,
});

var AdminMenu = Backbone.View.extend(/** @lends AdminMenu.prototype */{
	el       : '#adminmenuwrap',
	tagName  : 'div',
	className: 'amm-adminmenu-view',
	isEditing: false,

	/**
	 * Initialize the admin menu.
	 *
	 * This class creates andrenders the whole menu
	 * based on the data provided by the PHP part.
	 *
	 * @class AdminMenu
	 * @augments Backbone.View
	 * @constructs AdminMenu object
	 */
	initialize: function () {
		this.editButton = new EditButtonView();
		this.trashView = new TrashView();

		// Initialize menu items

		this.menu = new Menu();
		this.trash = new Menu();

		this.initMenu(AdminMenuManager.menu, this.menu);
		this.initMenu(AdminMenuManager.trash, this.trash);

		// Allow for undo/redo
		this.undoManager = new Backbone.UndoManager({
			register: [this.menu, this.trash],
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

		this.$el.find('#adminmenu').addClass('ui-sortable-disabled');
	},

	/**
	 * Render the admin menu including edit buttons and trash.
	 *
	 * @returns {AdminMenu}
	 */
	render: function () {
		var $adminMenu = this.$el.find('#adminmenu'),
				collapse = this.$el.find('#collapse-menu').detach();

		$adminMenu.empty();

		// Render all menu items
		_.each(this.menu.models, function (item) {
			var menuItemView = new MenuItemView({model: item});
			$adminMenu.append(menuItemView.render().el);
		}, this);

		// Append collapse and edit button and the trash
		$adminMenu.append(collapse).append(this.editButton.render().el).append(this.trashView.render().el);

		// Render all trashed menu items
		_.each(this.trash.models, function (item) {
			var menuItemView = new MenuItemView({model: item});
			this.$el.find('#admin-menu-manager-trash').append(menuItemView.render().el);
		}, this);

		// Re-bind hoverIntent
		this.hoverIntent();

		// Re-init jQuery UI Sortable
		this.initSortable(this.isEditing);

		// Add listeners
		this.listenTo(this.editButton, 'isActive', this.toggleSortable);

		return this;
	},

	/**
	 * Initialize the menu collections with top level and submenu items.
	 *
	 * @param object menuObject The admin menu object.
	 * @param Backbone.Collection collection The collection the admin menu items will be added to.
	 */
	initMenu: function (menuObject, collection) {
		var count = 0, isTrash = AdminMenuManager.trash === menuObject;

		_.each(menuObject, function (el) {
			var menuItem = new MenuItem(el);

			menuItem.set('class', el[4]);
			menuItem.set('children', new Menu());

			if (!isTrash) {
				var $el = this.$el.find('#adminmenu > li');
				menuItem.set(4, $el.get(count).className);

				// Add current class if applicable
				if (jQuery($el.get(count)).hasClass('current') || jQuery($el.get(count)).hasClass('wp-has-current-submenu')) {
					menuItem.set('current', true);
				}
			}

			if (el[2].indexOf('.php') === -1) {
				menuItem.set('href', 'admin.php?page=' + el[2]);
			}

			collection.add(menuItem);

			if (el['children']) {
				var subCount = 0;
				_.each(el['children'], function (el) {
					var submenuItem = new MenuItem(el);

					if (!isTrash) {
						var $el = jQuery(this.view.$el.find('#adminmenu > li')[count]).find('li:not(.wp-submenu-head)');

						// Add current class if applicable
						if (jQuery($el.get(subCount)).hasClass('current')) {
							submenuItem.set('current', true);
						}
					}

					if (el[2].indexOf('.php') === -1) {
						submenuItem.set('href', this.parent[2] + '?page=' + el[2]);
					}

					submenuItem.set(5, menuItem.get(5));
					submenuItem.set(6, menuItem.get(6));
					submenuItem.set('class', menuItem.get(4));

					menuItem.attributes.children.add(submenuItem);

					subCount++;
				}, {view: this, parent: el});
			}

			count++;
		}, this);
	},

	/**
	 * Initialize jQuery UI Sortable.
	 *
	 * This happens after each rendering, due to new elements being added.
	 *
	 * @param bool isEditing Whether we are currently editing the menu or not.
	 */
	initSortable: function (isEditing) {
		// Default sortable options
		var options = {
			// If defined, the items can be dragged only horizontally or vertically. Possible values: "x", "y".
			axis       : 'y',
			// Disables the sortable if set to true.
			disabled   : !isEditing,
			// Specifies which items inside the element should be sortable.
			items      : '> li',
			// Prevents sorting if you start on elements matching the selector.
			cancel     : '#collapse-menu, #admin-menu-manager-edit, .amm-edit-options',
			// A selector of other sortable elements that the items from this list should be connected to.
			connectWith: '#adminmenuwrap ul',
			// This event is triggered when the user stopped sorting and the DOM position has changed.
			update     : jQuery.proxy(this.sortableUpdate, this),
			// This event is triggered during sorting, but only when the DOM position has changed.
			change     : jQuery.proxy(this.sortableChange, this)
		};

		// Main admin menu
		this.$el.find('#adminmenu')
				.sortable(_.extend(options, {connectWith: '.wp-submenu, #admin-menu-manager-trash'}))
				.sortable('refresh');

		// Sub menus
		this.$el.find('.wp-submenu')
				.sortable(_.extend(
						options,
						{
							items      : '> li:not(.wp-first-item)',
							connectWith: '#adminmenu, .wp-submenu, #admin-menu-manager-trash',
						}
				))
				.sortable('refresh');

		// Trash
		this.$el.find('#admin-menu-manager-trash')
				.sortable(_.extend(options, {connectWith: '#adminmenu, .wp-submenu'}))
				.sortable('refresh');

		if (!isEditing) {
			// somehow it doesn't apply this class even if it's initially disabled
			this.$el.find('ul').addClass('ui-sortable-disabled');
		}
	},

	/**
	 * Event listener for the edit button.
	 *
	 * Toggles the jQuery UI Sortable disabled state.
	 *
	 * @param bool isActive Whether we are currently editing the menu or not.
	 */
	toggleSortable: function (isActive) {
		this.isEditing = isActive;
		this.initSortable(isActive);
	},

	/**
	 * This is triggered after an element has been successfully sorted.
	 *
	 * @param event e
	 * @param object ui
	 */
	sortableUpdate: function (e, ui) {
		var itemSlug = ui.item.attr('data-slug'),
				newPosition = [ui.item.index()];

		// It's a submenu item
		if (ui.item.parent('.wp-submenu').length > 0) {
			newPosition[0] = newPosition[0] > 0 ? --newPosition[0] : 0;
			var parentPosition = jQuery('#adminmenu > li').index(ui.item.parents('li'));
			newPosition.unshift(parentPosition);
		}

		if (newPosition[0] === -1) {
			return;
		}

		/**
		 * Iterate through the admin menu object.
		 *
		 * Find the item's last position and move it to the new one.
		 */

		// Iterate on menu items
		var item = this.findInMenu(itemSlug, this.menu) || this.findInMenu(itemSlug, this.trash);

		if (item === undefined) {
			return;
		}

		// Get the item object from the old position
		item.collection.remove(item);

		// Move it to the new position
		if (ui.item.parent('#admin-menu-manager-trash').length > 0) {
			// Item was trashed
			this.trash.add(item, {at: newPosition[0]});
		} else if (newPosition.length === 1) {
			// Item was moved to the top level
			this.menu.add(item, {at: newPosition[0]});

			var _4 = item.get(4);
			if (_4 === '' || _4 === 'current') {
				item.set(4, item.get('class').replace('wp-has-current-submenu ', ''));
				item.set('class', _4);
			}
		} else if (newPosition.length === 2) {
			// Item was moved to a submenu
			this.menu.at(newPosition[0]).attributes.children.add(item, {at: newPosition[1]});
		}

		this.render();
	},

	/**
	 * This function is triggered during sorting.
	 *
	 * It ensures that items can't be moved after the collapse and edit buttons.
	 *
	 * @param event e
	 * @param object ui
	 */
	sortableChange: function (e, ui) {
		var $fixed = this.$el.find('#collapse-menu, #admin-menu-manager-edit, #admin-menu-manager-trash-view').detach();
		this.$el.find('#adminmenu').append($fixed);
	},

	/**
	 * Initialize the hoverIntent jQuery plugin.
	 *
	 * This happens after each rendering, due to new elements being added.
	 *
	 * @see /wp-admin/js/common.js for the source of this.
	 */
	hoverIntent: function () {
		var $adminmenu = this.$el.find('#adminmenu');
		$adminmenu.find('li.wp-has-submenu').hoverIntent({
			over: function () {
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

			out: function () {
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
	},

	/**
	 * Find a menu item in a given collection.
	 *
	 * @param string itemSlug Slug of the item, e.g. `index.php`.
	 * @param Backbone.Collection collection The collection to search in.
	 * @returns The menu item object on success, undefined otherwise.
	 */
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
});

module.exports = AdminMenu;
