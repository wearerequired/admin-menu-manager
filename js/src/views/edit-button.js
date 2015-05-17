var EditButton = Backbone.View.extend({
	id      : 'admin-menu-manager-edit',
	tagName : 'li',
	template: require('templates/edit-button'),
	isActive: false,

	render: function () {
		this.$el.html(this.template(AdminMenuManager.templates.editButton));
		this.delegateEvents();
		return this;
	},

	events: {
		'click [href=#edit]'                  : 'edit',
		'click #amm-edit-option-save'         : 'save',
		'click #amm-edit-option-add'          : 'add',
		'click #amm-edit-option-add-separator': 'addSeparator',
		'click #amm-edit-option-add-custom'   : 'addCustomItem',
		'click #amm-edit-option-add-import'   : 'import',
		'click #amm-edit-option-add-export'   : 'export',
		'click #amm-edit-option-undo'         : 'undo',
		'click #amm-edit-option-redo'         : 'redo',
		'click #amm-edit-option-reset'        : 'reset'
	},

	edit: function (e) {
		e.preventDefault();

		this.initEditing();
	},

	initEditing: function () {
		this.isActive = !this.isActive;

		this.trigger('active', this.isActive);
		this.$el.toggleClass('active', this.isActive);
	},

	save: function (e) {
		e.preventDefault();

		this.isActive = !this.isActive;

		this.trigger('active', this.isActive);
		this.$el.toggleClass('active', this.isActive);
		this.trigger('save', this);
	},

	add: function (e) {
		e.preventDefault();

		this.$el.find('#amm-edit-option-add + .amm-edit-option-choices').toggleClass('hidden');

		// Trigger the WordPress admin menu resize event
		jQuery(document).trigger('wp-window-resized.pin-menu');
	},

	addSeparator: function (e) {
		e.preventDefault();

		this.trigger('addSeparator', this);
	},

	addCustomItem: function (e) {
		e.preventDefault();

		this.trigger('addCustomItem', this);
	},

	import: function (e) {
		e.preventDefault();
		this.trigger('import', this);
	},

	export: function (e) {
		e.preventDefault();
		this.trigger('export', this);
	},

	undo: function (e) {
		e.preventDefault();
		this.trigger('undo', this);
	},

	redo: function (e) {
		e.preventDefault();
		this.trigger('redo', this);
	},

	reset: function (e) {
		e.preventDefault();
		if (confirm(AdminMenuManager.templates.editButton.ays)) {
			this.trigger('resetMenu', jQuery.proxy(this.resetCallback, this));
		}
	},

	resetCallback: function (e) {
		document.location.reload(true);
	}

});

module.exports = EditButton;
