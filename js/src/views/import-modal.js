var Modal = require( 'views/modal' );

var ImportModal = Modal.extend( {
	template: require( 'templates/modal' ),
	isActive: false,

	initialize: function ( options ) {
		this.options = options || {};

		this.options.templateData         = AdminMenuManager.templates.importModal;
		this.options.templateData.content = '';

		_.bindAll( this, 'render' );
	},

	render: function () {
		this.$el.html( this.template( this.options.templateData ) );

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close':          'close',
		'click #amm-modal-toolbar-button': 'import',
		'input #amm-modal-textarea':       'enableButton',
	},

	close: function ( e ) {
		e.preventDefault();

		this.trigger( 'close', this );
		this.remove();
	},

	import: function () {
		this.trigger( 'import', this.$el.find( '#amm-modal-textarea' ).val() );
		this.remove();
	},

	enableButton: function ( e ) {
		if ( e.target.value.length ) {
			this.$el.find( '#amm-modal-toolbar-button' ).removeAttr( 'disabled' );
		} else {
			this.$el.find( '#amm-modal-toolbar-button' ).attr( 'disabled', 'disabled' );
		}
	}

} );

module.exports = ImportModal;
