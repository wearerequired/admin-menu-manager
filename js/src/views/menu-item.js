var MenuItemOptionsView = require('views/menu-item-options');

var MenuItemView = Backbone.View.extend({
	tagName      : 'li',
	template     : require('templates/menu-item'),
	optionsActive: false,
	attributes   : function () {
		// Return model data
		return {
			class        : this.model.get(4),
			id           : this.model.get(5),
			'aria-hidden': this.model.get(4).indexOf('wp-menu-separator') > -1,
			'data-slug'  : this.model.get(2)
		};
	},

	initialize: function (attributes, options) {
		this.parent = attributes.parent;
	},

	render: function () {
		if (this.model.get(4).indexOf('wp-menu-separator') > -1) {
			this.template = _.template('<div class="separator"></div>');
		}

		this.$el.html(this.template(this.model.toJSON()));
		this.delegateEvents();

		return this;
	},

	events: {
		'click a': 'toggleOptions'
	},

	toggleOptions: function (e) {
		if (!this.parent.isEditing) {
			return;
		}

		e.preventDefault();

		var model,
				$target = jQuery(e.target).parents('[data-slug]'),
				slug = $target.attr('data-slug').replace('&', '&#038;');

		if ($target.find('.amm-menu-item-options').length > 0) {
			$target.removeClass('amm-is-editing');
			this.optionsView.remove();
			return;
		}

		if (this.model.get(2) === slug) {
			model = this.model;
		} else {
			model = _.find(this.model.children.models, function (el) {
				return el.get(2) === slug;
			});
		}

		if (!model) {
			return;
		}

		this.optionsView = new MenuItemOptionsView({model: model});
		this.listenTo(this.optionsView, 'save', function () {
			$target.removeClass('amm-is-editing');
			this.render();
		});

		$target.addClass('amm-is-editing');
		$target.append(this.optionsView.render().$el);
	}

});

module.exports = MenuItemView;
