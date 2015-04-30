var MenuItemView = Backbone.View.extend({
	tagName   : 'li',
	template  : require('templates/menu-item'),
	attributes: function () {
		// Return model data
		return {
			class        : this.model.get(4),
			id           : this.model.get(5),
			'aria-hidden': this.model.get(4).indexOf('wp-menu-separator') > -1
		};
	},

	render: function () {
		if (this.model.get(4).indexOf('wp-menu-separator') > -1) {
			this.template = _.template('<div class="separator"></div>');
		}

		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	events: {},

});

module.exports = MenuItemView;
