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

	initialize: function (attributes, options) {
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
			'0'       : this.attributes[0], // label
			'3'       : this.attributes[3], // page title
			'4'       : this.attributes[4], // classes
			'2'       : this.attributes[2], // slug
			'href'    : this.attributes['href'] ? this.attributes['href'] : this.attributes[2], // href
			'5'       : this.attributes[5], // id
			'6'       : this.attributes[6], // icon
			'1'       : this.attributes[1], // capability
			children  : children,
			current   : this.attributes['current'],
			label     : this.attributes[0],
			pageTitle : this.attributes[3],
			classes   : this.attributes[4],
			slug      : this.attributes[2],
			id        : this.attributes[5],
			icon      : this.attributes[6],
			capability: this.attributes[1],
		};
	}
});

var Children = Backbone.Collection.extend({
	model: MenuItem
});

module.exports = MenuItem;
