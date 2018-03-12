import ExportModalTemplate from '../templates/modal.html';
import Modal from './modal';

const ExportModal = Modal.extend( {
	template: ExportModalTemplate,
	isActive: false,

	initialize: function ( options ) {
		this.options = options;

		this.options.templateData         = AdminMenuManager.templates.exportModal;
		this.options.templateData.content = this.options.content;

		_.bindAll( this, 'render' );
	},

	render: function () {
		this.$el.html( this.template( this.options.templateData ) );
		this.$el.find( '#amm-modal-toolbar-button' ).removeAttr( 'disabled' );

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close':          'close',
		'click #amm-modal-toolbar-button': 'close',
		'focus #amm-modal-textarea':       'selectText',
	},

	close: function ( e ) {
		e.preventDefault();

		this.trigger( 'close', this );
		this.remove();
	},

	selectText: function ( e ) {
		jQuery( e.target ).select();
	}

} );

export default ExportModal;
