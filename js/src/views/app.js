// Create the view for the admin bar
var AdminMenu = require('views/adminmenu');

var AppView = Backbone.View.extend({
	el: 'body',

	initialize: function () {
		this.adminMenu = new AdminMenu({model: this.model});
		this.render();

		this.listenTo(this.adminMenu.editButton, 'sendData', this.sendData);
	},

	render: function () {
		this.adminMenu.render();
		return this;
	},

	sendData: function (callback) {
		var data = {
			action   : 'amm_update_menu',
			adminMenu: this.adminMenu.menu.toJSON(),
		};

		jQuery.post(ajaxurl, data, function () {
			callback();
		});
	}
});

module.exports = AppView;
