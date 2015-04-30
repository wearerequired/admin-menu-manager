var EditButtonModel = require('models/edit-button');
var EditButtonView = require('views/edit-button');
var MenuItem = require('models/menu-item');
var MenuItemView = require('views/menu-item');

var AdminMenu = Backbone.View.extend({
	el       : '#adminmenuwrap',
	tagName  : 'div',
	className: 'amm-adminmenu-view',

	initialize: function () {
		this.editButton = new EditButtonView({model: new EditButtonModel()});

		// Initialize menu items

		var Menu = Backbone.Collection.extend({
			model: MenuItem,
		});

		this.menu = new Menu();

		var count = 0;
		_.each(AdminMenuManager.menu, function (el) {
			el[4] = this.$el.find('#adminmenu > li')[count].className + ' ui-sortable-handle';
			var menuItem = new MenuItem(el);
			menuItem.set('children', new Menu());
			this.menu.add(menuItem);
			if (AdminMenuManager.submenu[menuItem.get(2)]) {
				var subCount = 0;
				_.each(AdminMenuManager.submenu[menuItem.get(2)], function (el) {
					el[4] = this.$el.find('#adminmenu > li')[count].className;
					el[4] += jQuery(this.$el.find('#adminmenu > li')[count]).find('li:not(.wp-submenu-head)')[subCount].className;
					el[4] += ' ui-sortable-handle ';
					el[4] += menuItem.get(5);
					el[6] = menuItem.get(6);
					menuItem.attributes.children.add(new MenuItem(el));

					subCount++;
				}, this);
			}

			count++;
		}, this);
	},

	render: function () {
		this.$el.find('#adminmenu').append(this.editButton.render().el);

		// Initialize sortable
		this.$el.find('ul').sortable({
			disabled   : true,
			cancel     : '#admin-menu-manager-edit, #collapse-menu',
			connectWith: '#adminmenuwrap ul',
			// This event is triggered when (surprise) sortable starts
			create     : jQuery.proxy(this.sortableCreate, this),
			// This event is triggered when the user stopped sorting and the DOM position has changed.
			update     : jQuery.proxy(this.sortableUpdate, this),
			change     : jQuery.proxy(this.sortableChange, this)
		}).addClass('ui-sortable-disabled'); // somehow it doesn't apply this class even if it's initially disabled

		// Add listeners
		this.listenTo(this.editButton, 'isActive', this.toggleSortable);

		return this;
	},

	events: {},

	toggleSortable: function (isActive) {
		this.$el.find('ul').sortable('option', 'disabled', !isActive);
	},

	removeMenuClasses: function () {
		// Remove unneccessary classes again from the menu items
		_.each(this.$el.find('#adminmenu > .menu-top.wp-has-submenu'), function (el) {
			var $el = jQuery(el);
			if ($el.find('li').length <= 1) {
				$el.removeClass('wp-has-current-submenu wp-has-submenu');
			}
		});
	},

	sortableCreate: function (e, ui) {
		// On init, store each menu item's initial state
		var separatorIndex = 0;

		_.each(jQuery('#adminmenu li:not(.wp-submenu-head)'), function (el, index) {
			var $el = jQuery(el);
			// Add this data attribute to separators to make things easier when sorting
			if ($el.hasClass('wp-menu-separator')) {
				$el.attr('data-amm-separator', 'separator' + (++separatorIndex));
			}
		});

		jQuery('[data-amm-separator=separator' + separatorIndex + ']').attr('data-amm-separator', 'separator-last');

	},

	sortableUpdate: function (e, ui) {
		var itemHref = ui.item.find('a').attr('href'),
				newPosition = ui.item.index(),
				isSeparator = ui.item.is('.wp-menu-separator'),
				separator = ui.item.attr('data-amm-separator'),
				currentPosition = [ui.item.index()];

		// It's a submenu item
		if (ui.item.parent('.wp-submenu').length > 0) {
			newPosition = newPosition > 0 ? --newPosition : 0;
			var parentPosition = jQuery('#adminmenu > li').index(ui.item.parents('li'));
			currentPosition = [parentPosition, newPosition];
		}

		/**
		 * Iterate through the admin menu object.
		 *
		 * Find the item's last position and move it to the new one.
		 */

		// Iterate on menu items
		var item = this.findInMenu(itemHref, this.menu, separator);

		if (item === undefined) {
			return;
		}

		// Get the item object from the old position
		item.collection.remove(item);

		// Move it to the new position
		if (currentPosition.length === 1) {
			this.menu.add(item, {at: currentPosition[0]});
		} else if (currentPosition.length === 2) {
			this.menu.at(currentPosition[0]).add(item, {at: currentPosition[1]});
			item = this.menu.at(currentPosition[0]);
		}

		// Re-render the current item
		var menuItemView = new MenuItemView({model: item});
		var newItem = menuItemView.render().$el;

		_.each(['class', 'id', 'aria-hidden', 'aria-haspopup'], function (attr) {
			ui.item.attr(attr, newItem.attr(attr));
			ui.item.find('> a').attr(attr, newItem.attr(attr));
		});
		ui.item.find('> a').replaceWith(newItem.find('> a'));
		ui.item.find('ul').replaceWith(newItem.find('ul'));
	},

	sortableChange: function (e, ui) {
		// todo: show the submenu items of an element close to the current item so we could move it there

		// Items can't be moved after the collapse and edit buttons
		var $fixed = this.$el.find('#admin-menu-manager-edit, #collapse-menu').detach();
		this.$el.find('#adminmenu').append($fixed);
	},

	findInMenu: function (itemHref, collection, separator) {
		var result;

		collection.find(function (menuItem, index) {
			// Accommodate for different structures
			var isSame = ( menuItem.get(2) && itemHref && menuItem.get(2) === itemHref );
			if (!isSame && menuItem.get(2).indexOf('.') === -1 && menuItem.get(2) && itemHref) {
				isSame = 'admin.php?page=' + menuItem.get(2) === itemHref || menuItem.get('parent') + '?page=' + menuItem.get(2) === itemHref;
			}

			if (isSame || ( menuItem.get(4).indexOf('wp-menu-separator') > -1 && menuItem.get(2) === separator )) {
				result = menuItem;
				return true;
			}

			if (menuItem.get('children').length === 0) {
				return false;
			}

			// Loop through sub menu items
			var item = this.findInMenu(itemHref, menuItem.get('children'), separator);
			if (item !== undefined) {
				result = item;
				return true;
			}
		}, this);

		return result;
	}
});

module.exports = AdminMenu;
