var CollectionView = require( 'views/collectionview' );

var AdminMenu = CollectionView.extend( {
	id:        'amm-adminmenu',
	isEditing: false,

	/**
	 * Initializes the admin menu.
	 *
	 * @class AdminMenu
	 * @augments Backbone.View
	 * @constructs AdminMenu object
	 */
	initialize: function( options ) {
		CollectionView.prototype.initialize.apply( this, [ options ] );

		this.collection.reset( AdminMenuManager.menu );
	}
} );

module.exports = AdminMenu;
