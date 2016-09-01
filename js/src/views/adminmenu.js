var CollectionView = require( 'views/collectionview' ),
    Menu           = require( 'collections/menu' );

var AdminMenu = CollectionView.extend( {
	id:        'amm-adminmenu',
	isEditing: false,

	/**s
	 * Initialize the admin menu.
	 *
	 * This class creates and renders the whole menu
	 * based on the data provided by the PHP part.
	 *
	 * @class AdminMenu
	 * @augments Backbone.View
	 * @constructs AdminMenu object
	 */
	initialize: function() {
		// Ensure our methods keep the `this` reference to the view itself
		_.bindAll( this, 'render' );

		this.collection = new Menu();
		this.collection.reset( AdminMenuManager.menu );
	}
} );

module.exports = AdminMenu;
