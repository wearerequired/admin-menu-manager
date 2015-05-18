var MenuItemView = Backbone.View.extend({
	tagName   : 'li',
	template  : require('templates/menu-item'),
	attributes: function () {
		// Return model data
		return {
			class        : this.model.get(4),
			id           : this.model.get(5),
			'aria-hidden': this.model.get(4).indexOf('wp-menu-separator') > -1,
			'data-slug'  : this.model.get(2)
		};
	},

	initialize: function () {
		//this.model.on('change', this.render, this);
	},

	render: function () {
		if (this.model.get(4).indexOf('wp-menu-separator') > -1) {
			this.template = _.template('<div class="separator"></div>');
		}

		this.$el.html(this.template(this.model.toJSON()));
		this.delegateEvents();

		return this;
	}

});

module.exports = MenuItemView;
