const MenuItem = Backbone.Model.extend({
	defaults: {
		0: '', // Menu title
		1: 'read', // Capability
		2: '', // Slug
		3: '', // Page title
		4: '', // Classes
		5: '', // Hook suffix
		6: 'dashicons-admin-settings' // Icon
	},

	idAttribute: '2',

	initialize: function( attributes, options ) {
		this.children = new Backbone.Collection([], { model: MenuItem });
		if ( this.get( 'children' ) ) {
			this.children.reset( this.get( 'children' ) );
			this.unset( 'children' );
		}
	},

	toJSON: function( options ) {
		let children = [];

		if ( this.children ) {
			children = _.map( this.children.models, function( model ) {
				return model.toJSON( options );
			});
		}

		const capability = this.attributes[ 1 ];
		const classes    = this.attributes[ 4 ];
		const href       = this.attributes.href ? this.attributes.href : this.attributes[ 2 ];
		const icon       = this.attributes[ 6 ];
		const id         = this.attributes.id ? this.attributes.id : this.id;
		const label      = this.attributes[ 0 ];
		const pageTitle  = this.attributes[ 3 ];
		const slug       = this.attributes[ 2 ];

		return {
			'0': label,
			'3': pageTitle,
			'4': classes,
			'2': slug,
			'5': id,
			'6': icon,
			'1': capability,
			href,
			children,
			label,
			pageTitle,
			classes,
			slug,
			id,
			icon,
			capability
		};
	}
});

export default MenuItem;
