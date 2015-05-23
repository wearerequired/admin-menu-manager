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
				slug = model.get('href') ? model.get('href') : model.get(2);

		// If it's empty then we're most probably on the dashboard
		if ('' === self) {
			self = 'index.php';
		}

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

		if (!!model.get('is_plugin_item') || slug.indexOf('#') === -1 && slug.indexOf('.php') === -1 && slug.indexOf('http') === -1) {
			model.set('href', 'admin.php?page=' + slug);
		}

		if (model.children) {
			classes.push('wp-has-submenu');

			model.children.each(function (model) {
				var slug = model.get(2), parentHref = this.parent.get('href') ? this.parent.get('href') : this.parent.get(2);

				if (parentHref.search('\\?page=') > -1) {
					parentHref = parentHref.substr(0, parentHref.search('\\?page='));
				}

				if ((AdminMenuManager.submenu_file && slug === AdminMenuManager.submenu_file) ||
						(!AdminMenuManager.plugin_page && self === slug) ||
						(AdminMenuManager.plugin_page && AdminMenuManager.plugin_page === slug &&
						( this.parent.get(2) === self + '?post_type=' + window.typenow || parentHref === self || 'admin.php' === self) )
				) {
					model.set(4, model.get(4) + ' current');

					// Mark parent as active if child is the current item
					if (!_.contains(classes, 'wp-has-current-submenu')) {
						classes.push('wp-has-current-submenu');
						classes.push('wp-menu-open');
					}
				}

				if (slug.indexOf('http') >= 0) {
					model.set('href', slug);
				} else if (!!model.get('inherit_parent')) {
					model.set('href', parentHref + '?page=' + slug);
				} else if (slug.indexOf('#') >= 0) {
					model.set('href', slug);
				} else if (slug.indexOf('custom-item') >= 0) {
					model.set('href', '#' + slug);
				} else if (slug.indexOf('.php') >= 0) {
					model.set('href', slug);
				} else {
					model.set('href', 'admin.php?page=' + slug);
				}
			}, {parent: model});
		}

		model.set(4, _.uniq(classes).join(' '));
	},

	url: function () {
		var type = this.options && this.options.type ? this.options.type : '';
		return ajaxurl + '?action=adminmenu&type=' + type;
	},

	save: function (callback) {
		Backbone.sync('create', this, {
			success: function () {
				if (typeof(callback) === typeof(Function)) {
					callback();
				}
			},
		});
	},

	destroy: function (callback) {
		Backbone.sync('delete', this, {
			success: function () {
				if (typeof(callback) === typeof(Function)) {
					callback();
				}
			},
		});
	},

	/**
	 * Get a model of this collection or a matching child.
	 *
	 * @param obj
	 * @returns {*}
	 */
	getRecursively: function (obj) {
		var allChildren = _.flatten(this.map(function (model) {
			return model.children ? [model.children.models] : [];
		}));

		return this.get(obj) ||
				_.find(allChildren, function (model) {
					return model.id === obj;
				});
	}
});

module.exports = Menu;
