import EditModalTemplate from '../templates/edit-modal.html';
import Modal from './modal';

const EditModal = Modal.extend( {
	template: _.template( EditModalTemplate ),
	isActive: false,

	initialize: function( options ) {
		this.options = options;

		this.options.templateData = AdminMenuManager.templates.editModal;
		this.options.templateData.model = this.model.toJSON();

		_.bindAll( this, 'render' );
	},

	render: function() {
		this.$el.html( this.template( this.options.templateData ) );
		this.$el.find( '.dashicons-picker' ).dashiconsPicker();

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close':          'close',
		'click #amm-modal-toolbar-button': 'save'
	},

	close: function() {
		this.$el.find( '.dashicons-picker' ).trigger( 'mouseup' );

		Modal.prototype.close.call(this);
	},

	save: function () {
		this.model.set( 0, this.$el.find( 'input[name=amm-menu-item-option-name]' ).val() );
		this.model.set( 6, this.$el.find( 'input[name=amm-menu-item-option-icon]' ).val() );
		this.model.set( 'href', this.$el.find( 'input[name=amm-menu-item-option-href]' ).val() );

		this.remove();

		this.trigger( 'save' );
	}
} );

export default EditModal;
