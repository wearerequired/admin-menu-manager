var CollapseButton = Backbone.View.extend({
	tagName   : 'li',
	template  : require('templates/collapse-button'),
	attributes: function () {
		return {
			class        : 'ui-sortable-handle',
			id           : 'collapse-menu'
		};
	},

	render: function () {
		this.$el.html(this.template(AdminMenuManager.templates.collapseButton));
		return this;
	},

	events: {},

});

module.exports = CollapseButton;
