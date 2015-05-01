module.exports = Backbone.Model.extend({
	defaults   : {
		0       : '', // Menu title
		1       : '', // Capability
		2       : '', // Slug
		3       : '', // Page title
		4       : '', // Classes
		5       : '', // Hook suffix
		6       : 'dashicons-admin-settings', // Icon
		children: [] // Sub menu items,
	},
	idAttribute: '2',

	toJSON: function (options) {
		return {
			label     : this.attributes[0],
			pageTitle : this.attributes[3],
			classes   : this.attributes[4],
			slug      : this.attributes[2],
			href      : this.attributes['href'] ? this.attributes['href'] : this.attributes[2],
			id        : this.attributes[5],
			icon      : this.attributes[6],
			capability: this.attributes[1],
			children  : _.map(this.attributes.children.models, function (model) {
				return model.toJSON(options);
			}),
			current   : this.attributes['current']
		};
	}
});
