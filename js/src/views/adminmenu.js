var CollectionView = require('views/collectionview'),
		Menu = require('collections/menu');

var AdminMenu = CollectionView.extend(/** @lends AdminMenu.prototype */{
	isEditing: false,
	id       : 'amm-adminmenu',

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
		// Ensure our methods keep the `this` reference to the view itself
		_.bindAll(this, 'render');

		this.collection = new Menu();
		this.collection.reset(AdminMenuManager.menu);

		// Bind collection changes to re-rendering
		this.collection.on('reset', this.render);
		this.collection.on('add', this.render);
		this.collection.on('remove', this.render);

		this.render();
	},
});

module.exports = AdminMenu;
