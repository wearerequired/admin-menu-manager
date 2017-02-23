var Modal = Backbone.View.extend( {
	id:       'admin-menu-manager-modal',
	template: require( 'templates/modal' ),
	isActive: false,

	initialize: function ( options ) {
		this.options = options;
		_.bindAll( this, 'render' );
	},

	render: function () {
		this.$el.html( this.template( this.options.templateData ) );
		this.delegateEvents();
		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
	},

	close: function ( e ) {
		e.preventDefault();

		this.trigger( 'close', this );
		this.remove();
	},
	}
}, {
	extend: function( protoProps, staticProps ) {
		var parent = this;

		protoProps.events = _.extend(
			{},
			parent.prototype.events ? parent.prototype.events : {},
			protoProps.events ? protoProps.events : {}
		);

		return Backbone.View.extend.apply( parent, arguments );
	}
} );

module.exports = Modal;
