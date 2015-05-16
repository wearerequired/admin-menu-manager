var MenuItem = Backbone.Model.extend({
	defaults: {
		0: '', // Menu title
		1: 'read', // Capability
		2: '', // Slug
		3: '', // Page title
		4: '', // Classes
		5: '', // Hook suffix
		6: 'dashicons-admin-settings', // Icon
	},

	idAttribute: '2',

	initialize: function () {
		if (this.get('children')) {
			this.children = new Backbone.Collection([], {model: MenuItem});
			this.children.reset(this.get('children'));

			this.unset('children');
		}
	},

	toJSON: function (options) {
		var children = [];

		if (this.children) {
			children = _.map(this.children.models, function (model) {
				return model.toJSON(options);
			});
		}

		return {
			label     : this.attributes[0],
			pageTitle : this.attributes[3],
			classes   : this.attributes[4],
			slug      : this.attributes[2],
			href      : this.attributes['href'] ? this.attributes['href'] : this.attributes[2],
			id        : this.attributes[5],
			icon      : this.attributes[6],
			capability: this.attributes[1],
			children  : children,
			current   : this.attributes['current']
		};
	}
});

var Children = Backbone.Collection.extend({
	model: MenuItem
});

module.exports = MenuItem;
