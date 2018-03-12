import ModalTemplate from '../templates/modal.html';

const Modal = Backbone.View.extend( {
	id:       'admin-menu-manager-modal',
	template: _.template( ModalTemplate ),
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
		'keydown':                'keydownHandler'
	},

	/**
	 * Handle esc key presses.
	 *
	 * @param {Event} e Event object.
	 */
	keydownHandler: function ( e ) {
		if ( 27 === e.keyCode ) {
			this.close( e );
		} else if ( 9 === e.keyCode ) {
			this.constrainTabbing( e );
		}
	},

	/**
	 * Constrain tabbing within the modal.
	 *
	 * @param {Event} e Event object.
	 */
	constrainTabbing: function ( e ) {
		const title         = this.$el.find( '#amm-modal-title' ),
			  primaryButton = this.$el.find( '#amm-modal-toolbar-button' ),
			  closeButton   = this.$el.find( '#amm-modal-close' );

		if ( closeButton[ 0 ] === e.target ) {
			if ( e.shiftKey ) {
				primaryButton.focus();
			} else {
				title.focus();
			}
			e.preventDefault();
		} else if ( title[ 0 ] === e.target && e.shiftKey ) {
			closeButton.focus();
			e.preventDefault();
		} else if ( primaryButton[ 0 ] === e.target && !e.shiftKey ) {
			closeButton.focus();
			e.preventDefault();
		}
	},

	/**
	 * Closes the modal.
	 *
	 * @param {Event} e Event object.
	 */
	close: function ( e ) {
		e.preventDefault();

		this.trigger( 'close', this );
		this.remove();
	}
}, {
	extend: function ( protoProps, staticProps ) {
		const parent = this;

		protoProps.events = _.extend(
			{},
			parent.prototype.events ? parent.prototype.events : {},
			protoProps.events ? protoProps.events : {}
		);

		return Backbone.View.extend.apply( parent, arguments );
	}
} );

export default Modal;
