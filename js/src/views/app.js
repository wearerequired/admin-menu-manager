// Create the view for the admin bar
var AdminMenu = require('views/adminmenu');

var AppView = Backbone.View.extend({
  el: 'body',

  initialize: function () {
    this.adminMenu = new AdminMenu({model: this.model});
  },

  render: function () {
    this.adminMenu.render();
    return this;
  }
});

module.exports = AppView;
