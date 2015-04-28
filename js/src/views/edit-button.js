var EditButton = Backbone.View.extend({
  id      : 'admin-menu-manager-edit',
  tagName : 'div',
  template: require('templates/edit-button'),
  isActive: false,

  initialize: function () {
    this.model.set('label', AdminMenuManager.templates.editButton.labelEdit);
    this.model.set('icon', 'dashicons-edit');
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  events: {
    'click a': 'buttonClick'
  },

  buttonClick: function (e) {
    e.preventDefault();

    this.isActive = !this.isActive;

    this.trigger('isActive', this.isActive);

    if (this.isActive) {
      this.model.set('label', AdminMenuManager.templates.editButton.labelSave);
      this.model.set('icon', 'dashicons-yes');
      this.render();
    } else {
      //this.trigger('sendData');
      var data = {
        action   : 'amm_update_menu',
        adminMenu: AdminMenuManager.adminMenu
      };

      var that = this;

      jQuery.post(ajaxurl, data, function () {
        that.model.set('label', AdminMenuManager.templates.editButton.labelSaving);
        that.model.set('icon', 'dashicons-edit');
        that.render();

        that.$el.fadeOut(1000, function () {
          that.model.set('label', AdminMenuManager.templates.editButton.labelSaved);
          that.render();
          that.$el.fadeIn().delay(1000).fadeOut(50, function () {
            that.model.set('label', AdminMenuManager.templates.editButton.labelEdit);
            that.render();
            that.$el.fadeIn(50);
          });
        });
      });
    }
  }

});

module.exports = EditButton;
