import MenuItemView from './menu-item';

const CollectionView = Backbone.View.extend({

	// Can't be named views because wp.Backbone would think it's a wp.Backbone subview.
	_views: [],

	/**
	 * Initializes a collection view.
	 *
	 * The collection's model views are generated one by one and rendered afterwards as a whole.
	 *
	 * When updating the collection, i.e. by sorting, the menu needs to be reset and built from scratch.
	 *
	 * Ideally, we would use a comparator to sort the models based on their appearance in the menu.
	 *
	 * @class CollectionView
	 * @augments Backbone.View
	 * @constructs CollectionView object
	 *
	 * @param {Array} options
	 */
	initialize: function( options ) {
		this.options = options;

		// Ensure our methods keep the `this` reference to the view itself
		_.bindAll( this, 'render', 'add', 'remove', 'reset' );

		this.collection.each( this.add );

		// Bind collection changes to re-rendering
		this.collection.on( 'add', this.reset );
		this.collection.on( 'remove', this.reset );
		this.collection.on( 'reset', this.reset );
	},

	/**
	 * Renders the collection.
	 *
	 * @returns {CollectionView}
	 */
	render: function() {
		this.$el.empty();

		_.each( this._views, function( view ) {
			this.$el.append( view.render().el );
		}, this );

		this.delegateEvents();

		return this;
	},

	/**
	 * Adds a model to the collection view.
	 *
	 * @param {MenuItem} model
	 */
	add: function( model ) {
		const menuItemView = new MenuItemView({
			model: model,
			parent: this
		});

		this._views.push( menuItemView );

		return this;
	},

	/**
	 * Resets the whole collection view.
	 */
	reset: function() {
		this._views = [];

		this.collection.each( this.add );
		this.render();

		return this;
	}
});

export default CollectionView;
