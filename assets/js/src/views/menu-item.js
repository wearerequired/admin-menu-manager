import MenuItemTemplate from '../templates/menu-item.html';

const MenuItemView = Backbone.View.extend({
	tagName: 'li',
	template: _.template( MenuItemTemplate ),
	optionsActive: false,
	attributes: function() {

		// Return model data
		return {
			class: this.model.get( 4 ),
			id: this.model.get( 5 ),
			'aria-hidden': -1 < this.model.get( 4 ).indexOf( 'wp-menu-separator' ),
			'data-id': this.model.id
		};
	},

	initialize: function( attributes, options ) {
		this.parent = attributes.parent;
	},

	render: function() {
		if ( -1 < this.model.get( 4 ).indexOf( 'wp-menu-separator' ) ) {
			this.template = _.template( '<div class="separator"></div>' );
		}

		this.$el.html( this.template( this.model.toJSON() ) );
		this.delegateEvents();

		return this;
	},

	events: {
		'click a': 'editMenuItem'
	},

	editMenuItem: function( e ) {
		if ( ! this.parent.isEditing ) {
			return;
		}

		let $target = jQuery( e.target ).parents( '[data-id]' ).first(),
			slug    = $target.attr( 'data-id' ).replace( '&', '&#038;' ),
			model;

		if ( this.model.get( 2 ) === slug ) {
			model = this.model;
		} else {

			// It's a sub menu item.
			model = _.find( this.model.children.models, function( el ) {
				return el.get( 2 ) === slug;
			});
		}

		if ( ! model ) {
			return;
		}

		e.preventDefault();

		Backbone.trigger( 'editItem', this, model );
	}
});

export default MenuItemView;
