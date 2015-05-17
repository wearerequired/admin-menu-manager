// Create the view for the admin bar
var AdminMenu = require('views/adminmenu'),
		CollapseButton = require('views/collapse-button'),
		EditButton = require('views/edit-button'),
		TrashView = require('views/trash'),
		MenuItem = require('models/menu-item');

var AppView = wp.Backbone.View.extend({
	el       : '#adminmenuwrap',
	template : require('templates/app'),
	isEditing: false,

	initialize: function () {
		_.bindAll(this, 'sortableUpdate');
		this.delegateEvents();

		this.views.set('#admin-menu-manager-menu', new AdminMenu());
		this.views.set('#collapse-menu', new CollapseButton());
		this.views.set('#admin-menu-manager-edit', new EditButton());
		this.views.set('#admin-menu-manager-trash-view', new TrashView());

		// Listen to edit button activation
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'active', this.toggleSortable);

		// Listen to the save event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'save', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.save();
			this.views.first('#admin-menu-manager-trash-view').collection.save();

			this.render();
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'addSeparator', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.add(new MenuItem({
				'2': 'separator' + Math.floor(Math.random() * (100 - 1)) + 1, // todo: count instead of random
				'4': 'wp-menu-separator'
			}));

			this.render();
			this.initSortable(this.isEditing);
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'addCustomItem', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.add(new MenuItem({
				'0'   : 'Custom item',
				'1'   : 'read',
				'2'   : 'custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1, // todo: count instead of random
				'4'   : 'wp-not-current-submenu menu-top toplevel_page_custom',
				'5'   : 'custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1,
				'href': '#custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1 // todo: allow for custom URLs
			}));

			this.render();
			this.initSortable(this.isEditing);
		});

		// Allow for undo/redo
		this.undoManager = new Backbone.UndoManager({
			register: [
				this.views.first('#admin-menu-manager-menu').collection,
				this.views.first('#admin-menu-manager-trash-view').collection
			],
			track   : true
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'undo', function (view) {
			this.undoManager.undo(true);
			this.render();
			this.initSortable(this.isEditing);
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'redo', function (view) {
			this.undoManager.redo(true);
			this.render();
			this.initSortable(this.isEditing);
		});
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
			connectWith: '#amm-adminmenu ul',
			// This event is triggered when the user stopped sorting and the DOM position has changed.
			update     : this.sortableUpdate
		};

		// Main admin menu
		this.$el.find('#amm-adminmenu')
				.sortable(_.extend(options, {connectWith: '.wp-submenu, #admin-menu-manager-trash'}))
				.sortable('refresh');

		// Sub menus
		this.$el.find('.wp-submenu')
				.sortable(_.extend(
						options,
						{
							items      : '> li:not(.wp-first-item)',
							connectWith: '#amm-adminmenu, .wp-submenu, #admin-menu-manager-trash',
						}
				))
				.sortable('refresh');

		// Trash
		this.$el.find('#admin-menu-manager-trash')
				.sortable(_.extend(options, {connectWith: '#amm-adminmenu, .wp-submenu'}))
				.sortable('refresh');

		if (!isEditing) {
			// somehow it doesn't apply this class even if it's initially disabled
			this.$el.find('ul').addClass('ui-sortable-disabled');
		}

		// Trigger the WordPress admin menu resize event
		jQuery(document).trigger('wp-window-resized.pin-menu');

		// Trigger the SVG painter
		wp.svgPainter.init();
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
		var item =
				this.findInMenu(itemSlug, this.views.first('#admin-menu-manager-menu').collection) ||
				this.findInMenu(itemSlug, this.views.first('#admin-menu-manager-trash-view').collection);

		if (item === undefined) {
			return;
		}

		// Get the item object from the old position
		item.collection.remove(item);

		// Move it to the new position
		if (ui.item.parent('#admin-menu-manager-trash').length > 0) {
			// Item was trashed
			this.views.first('#admin-menu-manager-trash-view').collection.add(item, {at: newPosition[0]});
		} else if (newPosition.length === 1) {
			// Item was moved to the top level
			this.views.first('#admin-menu-manager-menu').collection.add(item, {at: newPosition[0]});
		} else if (newPosition.length === 2) {
			// Item was moved to a submenu
			this.views.first('#admin-menu-manager-menu').collection
					.at(newPosition[0]).children
					.add(item, {at: newPosition[1]});
		}

		this.render();

		// Re-bind hoverIntent
		this.hoverIntent();

		// Re-init jQuery UI Sortable
		this.initSortable(this.isEditing);
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

			if (!menuItem.children || menuItem.children.length === 0) {
				return false;
			}

			// Loop through sub menu items
			var item = this.findInMenu(itemSlug, menuItem.children);
			if (item !== undefined) {
				result = item;
				return true;
			}

		}, this);

		return result;
	},
});

module.exports = AppView;
