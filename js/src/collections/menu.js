var MenuItem = require('models/menu-item');

var Menu = Backbone.Collection.extend({
	model: MenuItem,

	initialize: function (models, options) {
		this.options = this.options || options;

		this.bind('reset', this.onReset);
		this.bind('add', this.parseModel);
	},

	onReset: function () {
		if (this.length === 0) {
			return;
		}

		this.first().set(4, this.first().get(4) + ' wp-first-item');

		this.each(function (model) {
			this.parseModel(model);

		}, this);
	},

	parseModel: function (model) {
		var classes,
				self = location.pathname.split('/').pop(),
				slug = model.get(2);

		if (slug.indexOf('separator') === 0) {
			return;
		}

		classes = model.get(4).split(' ');
		classes.push('menu-top');

		if (( AdminMenuManager.parent_file && slug === AdminMenuManager.parent_file ) ||
				( ( !window.typenow) && self === slug)
		) {
			if (model.children) {
				classes.push('wp-has-current-submenu');
				classes.push('wp-menu-open');
			} else {
				classes.push('current');
			}
		} else {
			classes.push('wp-not-current-submenu');
		}

		if (slug.indexOf('#') > -1 || slug.indexOf('.php') > -1) {
			model.set('href', slug);
		} else {
			model.set('href', 'admin.php?page=' + slug);
		}

		if (model.children) {
			classes.push('wp-has-submenu');

			model.children.each(function (model) {
				var slug = model.get(2), parentHref = this.parent.get('href');

				if (parentHref.search('\\?page=') > -1) {
					parentHref = parentHref.substr(0, parentHref.search('\\?page='));
				}

				if ((AdminMenuManager.submenu_file && slug === AdminMenuManager.submenu_file) ||
						(!AdminMenuManager.plugin_page && self === slug) ||
						(AdminMenuManager.plugin_page && AdminMenuManager.plugin_page === slug &&
						( this.parent.get(2) === self + '?post_type=' + window.typenow || parentHref === self) )
				) {
					model.set(4, model.get(4) + ' current');
				}

				if (slug.indexOf('#') === -1 && slug.indexOf('.php') === -1) {
					model.set('href', parentHref + '?page=' + slug);
				}
			}, {parent: model});
		}

		model.set(4, _.uniq(classes).join(' '));
	},

	url: function () {
		var type = this.options && this.options.type ? this.options.type : '';
		return ajaxurl + '?action=adminmenu&type=' + type;
	},

	save: function () {
		Backbone.sync('create', this, {
			success: function () {
				console.log('saved!');
			}
		});
	}
});

module.exports = Menu;
