// Create the view for the admin bar
var AdminMenu = require('views/adminmenu');

var AppView = Backbone.View.extend({
	el: 'body',

	initialize: function () {
		this.adminMenu = new AdminMenu({model: this.model});
		this.listenTo(this.adminMenu.editButton, 'saveMenu', this.saveMenu);
		this.listenTo(this.adminMenu.editButton, 'resetMenu', this.resetMenu);
	},

	render: function () {
		this.adminMenu.render();
		return this;
	},

	saveMenu: function (callback) {
		var data = {
			action: 'amm_update_menu',
			menu  : this.adminMenu.menu.toJSON(),
			trash : this.adminMenu.trash.toJSON(),
		};

		jQuery.post(ajaxurl, data, function () {
			callback();
		});
	},

	resetMenu: function (callback) {
		var data = {
			action: 'amm_reset_menu',
		};

		jQuery.post(ajaxurl, data, function () {
			callback();
		});
	}
});

module.exports = AppView;
