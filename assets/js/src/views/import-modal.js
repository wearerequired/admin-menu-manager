import ModalTemplate from '../templates/modal.html';
import Modal from './modal';

const ImportModal = Modal.extend({
	template: _.template( ModalTemplate ),
	isActive: false,

	initialize: function( options ) {
		this.options = options || {};

		this.options.templateData         = AdminMenuManager.templates.importModal;
		this.options.templateData.content = '';

		_.bindAll( this, 'render' );
	},

	render: function() {
		this.$el.html( this.template( this.options.templateData ) );

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
		'click #amm-modal-toolbar-button': 'import',
		'input #amm-modal-textarea': 'enableButton'
	},

	close: function() {
		this.trigger( 'close', this );
		this.remove();
	},

	import: function() {
		this.trigger( 'import', this.$el.find( '#amm-modal-textarea' ).val() );
		this.remove();
	},

	enableButton: function( e ) {
		if ( e.target.value.length ) {
			this.$el.find( '#amm-modal-toolbar-button' ).removeAttr( 'disabled' );
		} else {
			this.$el.find( '#amm-modal-toolbar-button' ).attr( 'disabled', 'disabled' );
		}
	}

});

export default ImportModal;
