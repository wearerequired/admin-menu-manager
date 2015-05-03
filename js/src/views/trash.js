var TrashView = Backbone.View.extend({
	id      : 'admin-menu-manager-trash-view',
	tagName : 'li',
	template: require('templates/trash'),
	isActive: false,

	render: function () {
		this.$el.html(this.template());
		return this;
	},

});

module.exports = TrashView;
