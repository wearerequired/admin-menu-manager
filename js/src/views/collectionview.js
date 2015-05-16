// Create the view for the admin bar
var MenuItemView = require('views/menu-item');

var CollectionView = Backbone.View.extend({
	collectionView: MenuItemView,

	renderCollection: function () {
		var els = [];

		// Go through the collection items
		this.collection.each(function (model) {

			// Instantiate a PeopleItem view for each
			var menuItemView = new MenuItemView({
				model: model
			});

			// Render the PeopleView, and append its element
			// to the table
			els.push(menuItemView.render().el);
		});

		return jQuery(els);
	}
});

module.exports = CollectionView;
