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
		'click'                       : 'edit',
		'click #amm-edit-option-save' : 'save',
		'click #amm-edit-option-undo' : 'undo',
		'click #amm-edit-option-redo' : 'redo',
		'click #amm-edit-option-reset': 'reset'
	},

	edit: function (e) {
		e.preventDefault();
		this.initEditing();
	},

	initEditing: function () {
		this.isActive = !this.isActive;

		this.trigger('isActive', this.isActive);
		this.$el.toggleClass('active', this.isActive);
	},

	save: function (e) {
		e.preventDefault();

		this.trigger('isActive', this.isActive);
		this.$el.toggleClass('active', this.isActive);
		this.trigger('saveMenu', jQuery.proxy(this.saveCallback, this));
	},

	saveCallback: function () {
		this.render();
	},

	undo: function (e) {
		e.preventDefault();
		this.trigger('undo');
	},

	redo: function (e) {
		e.preventDefault();
		this.trigger('redo');
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
