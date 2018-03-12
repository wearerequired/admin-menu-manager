(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _app = require("./views/app");

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function ($) {
	$(function () {
		'use strict';

		// Run Boy Run

		var app = new _app2.default();
		app.render();
	});
})(jQuery, Backbone); /**
                       * Admin Menu Manager
                       *
                       * Copyright (c) 2015 required
                       * Licensed under the GPLv2+ license.
                       */

},{"./views/app":11}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var MenuItem = require("./../../../../assets/js/src/models/menu-item");

var Menu = Backbone.Collection.extend({
	model: MenuItem,

	initialize: function initialize(models, options) {
		this.options = this.options || options;

		this.bind('reset', this.onReset);
		this.bind('add', this.onReset);
		this.bind('remove', this.onReset);
	},

	onReset: function onReset() {
		if (this.length === 0) {
			return;
		}

		this.first().set(4, this.first().get(4) + ' wp-first-item');

		this.parseModels();
	},

	parseModels: function parseModels() {
		this.each(function (model) {
			this.parseModel(model);
		}, this);
	},

	parseModel: function parseModel(model) {
		var classes,
		    self = location.pathname.split('/').pop(),
		    slug = model.get('href') ? model.get('href') : model.get(2);

		// If it's empty then we're most probably on the dashboard.
		if ('' === self) {
			self = 'index.php';
		}

		if (slug.indexOf('separator') === 0) {
			return;
		}

		classes = model.get(4).split(' ');
		classes.push('menu-top');

		if (AdminMenuManager.parent_file && slug === AdminMenuManager.parent_file || !window.typenow && self === slug) {
			if (model.children.length) {
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

		if (model.children.length) {
			classes.push('wp-has-submenu');

			model.children.each(function (model) {
				var slug = model.get(2),
				    parentHref = this.parent.get('href') ? this.parent.get('href') : this.parent.get(2);

				if (parentHref.search('\\?page=') > -1) {
					parentHref = parentHref.substr(0, parentHref.search('\\?page='));
				}

				if (AdminMenuManager.submenu_file && slug === AdminMenuManager.submenu_file || !AdminMenuManager.plugin_page && self === slug || AdminMenuManager.plugin_page && AdminMenuManager.plugin_page === slug && (this.parent.get(2) === self + '?post_type=' + window.typenow || parentHref === self || 'admin.php' === self)) {
					model.set(4, model.get(4) + ' current');

					// Mark parent as active if child is the current item.
					if (!_.contains(classes, 'wp-has-current-submenu') && !_.contains(classes, 'wp-not-current-submenu')) {
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
			}, { parent: model });
		}

		model.set(4, _.uniq(classes).join(' '));
	},

	url: function url() {
		var type = this.options && this.options.type ? this.options.type : '';
		return ajaxurl + '?action=adminmenu&type=' + type;
	},

	save: function save(callback) {
		Backbone.sync('create', this, {
			success: function success() {
				if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === (typeof Function === 'undefined' ? 'undefined' : _typeof(Function))) {
					callback();
				}
			}
		});
	},

	destroy: function destroy(callback) {
		Backbone.sync('delete', this, {
			success: function success() {
				if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === (typeof Function === 'undefined' ? 'undefined' : _typeof(Function))) {
					callback();
				}
			}
		});
	},

	/**
  * Returns a model of this collection or a matching child.
  *
  * @param {Object} obj
  * @returns {MenuItem}
  */
	getRecursively: function getRecursively(obj) {
		var allChildren = _.flatten(this.map(function (model) {
			return model.children.length ? [model.children.models] : [];
		}));

		return this.get(obj) || _.find(allChildren, function (model) {
			return model.id === obj;
		});
	}
});

module.exports = Menu;

},{"./../../../../assets/js/src/models/menu-item":3}],3:[function(require,module,exports){
'use strict';

var MenuItem = Backbone.Model.extend({
	defaults: {
		0: '', // Menu title
		1: 'read', // Capability
		2: '', // Slug
		3: '', // Page title
		4: '', // Classes
		5: '', // Hook suffix
		6: 'dashicons-admin-settings' // Icon
	},

	idAttribute: '2',

	initialize: function initialize(attributes, options) {
		this.children = new Backbone.Collection([], { model: MenuItem });
		if (this.get('children')) {
			this.children.reset(this.get('children'));
			this.unset('children');
		}
	},

	toJSON: function toJSON(options) {
		var children = [];

		if (this.children) {
			children = _.map(this.children.models, function (model) {
				return model.toJSON(options);
			});
		}

		return {
			'0': this.attributes[0], // label
			'3': this.attributes[3], // page title
			'4': this.attributes[4], // classes
			'2': this.attributes[2], // slug
			'href': this.attributes['href'] ? this.attributes['href'] : this.attributes[2], // href
			'5': this.attributes[5], // id
			'6': this.attributes[6], // icon
			'1': this.attributes[1], // capability
			children: children,
			label: this.attributes[0],
			pageTitle: this.attributes[3],
			classes: this.attributes[4],
			slug: this.attributes[2],
			id: this.id,
			icon: this.attributes[6],
			capability: this.attributes[1]
		};
	}
});

module.exports = MenuItem;

},{}],4:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul id="adminmenu">\n\t<div id="admin-menu-manager-menu"></div>\n\t<li id="admin-menu-manager-collapse"></li>\n\t<li id="admin-menu-manager-edit"></li>\n\t<li id="admin-menu-manager-trash-view"></li>\n\t<div id="admin-menu-manager-modal-view"></div>\n</ul>\n';
}
return __p;
};

},{}],5:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<button type="button" id="collapse-button" aria-label="'+
((__t=( ariaLabel ))==null?'':_.escape(__t))+
'" aria-expanded="true">\n\t<span class="collapse-button-icon" aria-hidden="true"></span>\n\t<span class="collapse-button-label">'+
((__t=( label ))==null?'':_.escape(__t))+
'</span>\n</button>\n';
}
return __p;
};

},{}],6:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<button class="menu-top" id="amm-edit-menu">\n\t<div class="wp-menu-image dashicons-before dashicons-edit"></div>\n\t<div class="wp-menu-name">'+
((__t=( label ))==null?'':__t)+
'</div>\n</button>\n<ul class="amm-edit-options">\n\t<li class="amm-edit-option">\n\t\t<button id="amm-edit-option-save">\n\t\t\t<div class="wp-menu-image dashicons-before dashicons-yes"><br></div>\n\t\t\t<div class="wp-menu-name screen-reader-text">'+
((__t=( options.save ))==null?'':__t)+
'</div>\n\t\t</button>\n\t</li>\n\t<li class="amm-edit-option">\n\t\t<button id="amm-edit-option-add">\n\t\t\t<div class="wp-menu-image dashicons-before dashicons-admin-settings"><br></div>\n\t\t\t<div class="wp-menu-name screen-reader-text">'+
((__t=( options.add ))==null?'':__t)+
'</div>\n\t\t</button>\n\t\t<ul class="amm-edit-option-choices hidden">\n\t\t\t<li class="amm-edit-option-choice">\n\t\t\t\t<button id="amm-edit-option-add-separator">'+
((__t=( options.addSeparator ))==null?'':__t)+
'</button>\n\t\t\t</li>\n\t\t\t<li class="amm-edit-option-choice">\n\t\t\t\t<button id="amm-edit-option-add-custom">'+
((__t=( options.addCustomItem ))==null?'':__t)+
'</button>\n\t\t\t</li>\n\t\t\t<li class="amm-edit-option-choice">\n\t\t\t\t<button id="amm-edit-option-add-import">'+
((__t=( options.addImport ))==null?'':__t)+
'</button>\n\t\t\t</li>\n\t\t\t<li class="amm-edit-option-choice">\n\t\t\t\t<button id="amm-edit-option-add-export">'+
((__t=( options.addExport ))==null?'':__t)+
'</button>\n\t\t\t</li>\n\t\t\t<li class="amm-edit-option-choice">\n\t\t\t\t<button id="amm-edit-option-reset">'+
((__t=( options.reset ))==null?'':__t)+
'</button>\n\t\t\t</li>\n\t\t</ul>\n\t</li>\n\t<li class="amm-edit-option">\n\t\t<button id="amm-edit-option-undo">\n\t\t\t<div class="wp-menu-image dashicons-before dashicons-undo"><br></div>\n\t\t\t<div class="wp-menu-name screen-reader-text">'+
((__t=( options.undo ))==null?'':__t)+
'</div>\n\t\t</button>\n\t</li>\n\t<li class="amm-edit-option">\n\t\t<button id="amm-edit-option-redo">\n\t\t\t<div class="wp-menu-image dashicons-before dashicons-redo"><br></div>\n\t\t\t<div class="wp-menu-name screen-reader-text">'+
((__t=( options.redo ))==null?'':__t)+
'</div>\n\t\t</button>\n\t</li>\n\t<li class="amm-edit-option">\n\t\t<button id="amm-edit-option-cancel">\n\t\t\t<div class="wp-menu-image dashicons-before dashicons-dismiss"><br></div>\n\t\t\t<div class="wp-menu-name screen-reader-text">'+
((__t=( options.cancel ))==null?'':__t)+
'</div>\n\t\t</button>\n\t</li>\n</ul>\n';
}
return __p;
};

},{}],7:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="amm-modal-content-wrap">\n\t<button class="button-link" id="amm-modal-close" aria-label="'+
((__t=( close ))==null?'':_.escape(__t))+
'">\n\t\t<span class="dashicons dashicons-no"></span>\n\t</button>\n\n\t<div id="amm-modal-content">\n\t\t<h1 id="amm-modal-title">'+
((__t=( title ))==null?'':_.escape(__t))+
'</h1>\n\n\t\t<p>\n\t\t\t<label for="amm-menu-item-option-name">'+
((__t=( labelLabel ))==null?'':_.escape(__t))+
'</label>\n\t\t\t<input name="amm-menu-item-option-name" class="amm-menu-item-option" value="'+
((__t=( model.label ))==null?'':_.escape(__t))+
'"/>\n\t\t</p>\n\t\t<p>\n\t\t\t<label for="amm-menu-item-option-icon">'+
((__t=( iconLabel ))==null?'':_.escape(__t))+
'</label>\n\t\t\t<input name="amm-menu-item-option-icon" class="amm-menu-item-option" id="amm-menu-item-option-icon" value="'+
((__t=( model.icon ))==null?'':_.escape(__t))+
'"/>\n\t\t\t<button class="button dashicons-picker" data-target="#amm-menu-item-option-icon">'+
((__t=( chooseIcon ))==null?'':_.escape(__t))+
'</button>\n\t\t</p>\n\t\t';
 if (model.id.indexOf('custom-item') > -1) { 
__p+='\n\t\t<p>\n\t\t\t<label for="amm-menu-item-option-href">'+
((__t=( linkLabel ))==null?'':_.escape(__t))+
'</label>\n\t\t\t<input name="amm-menu-item-option-href" class="amm-menu-item-option" value="'+
((__t=( model.href ))==null?'':_.escape(__t))+
'"/>\n\t\t</p>\n\t\t';
 } 
__p+='\n\t</div>\n\n\t<div id="amm-modal-toolbar">\n\t\t<button id="amm-modal-toolbar-button" class="button button-primary button-large">\n\t\t\t'+
((__t=( buttonText ))==null?'':_.escape(__t))+
'\n\t\t</button>\n\t</div>\n</div>\n<div id="amm-modal-backdrop"></div>\n';
}
return __p;
};

},{}],8:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a href="'+
((__t=( href ))==null?'':_.escape(__t))+
'" class="'+
((__t=( classes ))==null?'':_.escape(__t))+
'" aria-haspopup="'+
((__t=( children ? true: false ))==null?'':__t)+
'">\n\t<div class="wp-menu-arrow">\n\t\t<div></div>\n\t</div>\n\t';
 if ( icon.indexOf('dashicons') > -1 ) { 
__p+='\n\t<div class=\'wp-menu-image dashicons-before '+
((__t=( icon ))==null?'':_.escape(__t))+
'\'><br/></div>\n\t';
 } else if ( icon.indexOf('image/svg') > -1 || icon.indexOf('http') > -1 ) { 
__p+='\n\t<div class="wp-menu-image svg" style="background-image:url(\''+
((__t=( icon ))==null?'':__t)+
'\') !important;"><br/></div>\n\t';
 } else if ('div' === icon || 'none' === icon) { 
__p+='\n\t<div class="wp-menu-image dashicons-before"><br/></div>\n\t';
 } else { 
__p+='\n\t<div class="wp-menu-image dashicons-before dashicons-admin-settings"><br/></div>\n\t';
 } 
__p+='\n\t<div class="wp-menu-name">'+
((__t=( label ))==null?'':__t)+
'</div>\n</a>\n<ul class="wp-submenu wp-submenu-wrap">\n\t<li class="wp-submenu-head">'+
((__t=( label ))==null?'':__t)+
'</li>\n\t';
 _.each(children, function(child, index) {
	if ( index===0 ) { child.classes += ' wp-first-item'; }
	var classes = _.filter(child.classes.split(' '), function(c){return c==='current' || c==='wp-first-item'}).join(' '); 
__p+='\n\t<li class="'+
((__t=( classes ))==null?'':__t)+
'" data-id="'+
((__t=( child.id ))==null?'':__t)+
'">\n\t\t<a href="'+
((__t=( child.href ))==null?'':_.escape(__t))+
'" class="'+
((__t=( classes ))==null?'':__t)+
'">'+
((__t=( child.label ))==null?'':__t)+
'</a>\n\t</li>\n\t';
 }); 
__p+='\n</ul>\n';
}
return __p;
};

},{}],9:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="amm-modal-content-wrap">\n\t<button class="button-link" id="amm-modal-close" aria-label="'+
((__t=( close ))==null?'':_.escape(__t))+
'">\n\t\t<span class="dashicons dashicons-no"></span>\n\t</button>\n\n\t<div id="amm-modal-content">\n\t\t<h1 id="amm-modal-title">'+
((__t=( title ))==null?'':_.escape(__t))+
'</h1>\n\n\t\t<p>'+
((__t=( description ))==null?'':_.escape(__t))+
'</p>\n\t\t<label for="amm-modal-textarea" class="screen-reader-text">'+
((__t=( formLabel ))==null?'':_.escape(__t))+
'</label>\n\t\t<textarea id="amm-modal-textarea" name="amm-modal-textarea">'+
((__t=( content ))==null?'':_.escape(__t))+
'</textarea>\n\t</div>\n\n\t<div id="amm-modal-toolbar">\n\t\t<button id="amm-modal-toolbar-button" class="button button-primary button-large" disabled="disabled">\n\t\t\t'+
((__t=( buttonText ))==null?'':_.escape(__t))+
'\n\t\t</button>\n\t</div>\n</div>\n<div id="amm-modal-backdrop"></div>\n';
}
return __p;
};

},{}],10:[function(require,module,exports){
'use strict';

var CollectionView = require("./../../../../assets/js/src/views/collectionview");

var AdminMenu = CollectionView.extend({
	id: 'amm-adminmenu',
	isEditing: false,

	/**
  * Initializes the admin menu.
  *
  * @class AdminMenu
  * @augments Backbone.View
  * @constructs AdminMenu object
  */
	initialize: function initialize(options) {
		CollectionView.prototype.initialize.apply(this, [options]);

		this.collection.reset(AdminMenuManager.menu);
	}
});

module.exports = AdminMenu;

},{"./../../../../assets/js/src/views/collectionview":13}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _app = require('../templates/app.html');

var _app2 = _interopRequireDefault(_app);

var _adminmenu = require('./adminmenu');

var _adminmenu2 = _interopRequireDefault(_adminmenu);

var _collapseButton = require('./collapse-button');

var _collapseButton2 = _interopRequireDefault(_collapseButton);

var _editButton = require('./edit-button');

var _editButton2 = _interopRequireDefault(_editButton);

var _trash = require('./trash');

var _trash2 = _interopRequireDefault(_trash);

var _menuItem = require('../models/menu-item');

var _menuItem2 = _interopRequireDefault(_menuItem);

var _menu = require('../collections/menu');

var _menu2 = _interopRequireDefault(_menu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppView = wp.Backbone.View.extend({
	el: '#adminmenuwrap',
	template: _app2.default,
	isEditing: false,
	dropReceiver: undefined,

	initialize: function initialize() {
		_.bindAll(this, 'sortableUpdate', 'sortableStop');
		this.delegateEvents();

		this.views.set('#admin-menu-manager-menu', new _adminmenu2.default({ collection: new _menu2.default() }));
		this.views.set('#admin-menu-manager-collapse', new _collapseButton2.default());
		this.views.set('#admin-menu-manager-edit', new _editButton2.default());
		this.views.set('#admin-menu-manager-trash-view', new _trash2.default({ collection: new _menu2.default([], { type: 'trash' }) }));

		// Listen to edit button activation
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'active', function (isActive) {
			this.toggleSortable(isActive);
			this.views.first('#admin-menu-manager-menu').isEditing = isActive;
		});

		// Listen to the reset event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'reset', function () {
			this.views.first('#admin-menu-manager-menu').collection.destroy(_.bind(function () {
				this.views.first('#admin-menu-manager-trash-view').collection.destroy(function () {
					window.location.reload(true);
				});
			}, this));
		});

		// Listen to the save event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'save', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.save();
			this.views.first('#admin-menu-manager-trash-view').collection.save();

			this.views.first('#admin-menu-manager-menu').render();

			this.initSortable(false);
		});

		// Editing a single menu item
		Backbone.on('editItem', _.bind(function (view, model) {
			var EditModal = require("./../../../../assets/js/src/views/edit-modal");
			this.views.set('#admin-menu-manager-modal-view', new EditModal({
				model: model
			}));

			this.listenTo(this.views.first('#admin-menu-manager-modal-view'), 'save', _.bind(function (data) {
				this.views.first('#admin-menu-manager-menu').render();
			}, this));
		}, this));

		// Listen to the export event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'export', function (view) {
			var menu = this.views.first('#admin-menu-manager-menu').collection.toJSON();
			var trash = this.views.first('#admin-menu-manager-trash-view').collection.toJSON();

			var ExportModal = require("./../../../../assets/js/src/views/export-modal");
			this.views.set('#admin-menu-manager-modal-view', new ExportModal({
				content: JSON.stringify({ menu: menu, trash: trash })
			}));

			this.views.first('#admin-menu-manager-menu').render();
		});

		// Listen to the import event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'import', function (view) {
			var menu = this.views.first('#admin-menu-manager-menu').collection;
			var trash = this.views.first('#admin-menu-manager-trash-view').collection;

			var ImportModal = require("./../../../../assets/js/src/views/import-modal");
			this.views.set('#admin-menu-manager-modal-view', new ImportModal());

			this.listenTo(this.views.first('#admin-menu-manager-modal-view'), 'import', function (data) {
				data = JSON.parse(data);

				if (data.menu) {
					menu.reset(data.menu);
				}

				if (data.trash) {
					trash.reset(data.trash);
				}

				// Re-bind hoverIntent
				this.hoverIntent();

				// Re-init jQuery UI Sortable
				this.initSortable(this.isEditing);
			});
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'addSeparator', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.add(new _menuItem2.default({
				'2': 'separator' + Math.floor(Math.random() * (100 - 1)) + 1, // todo: count instead of random
				'4': 'wp-menu-separator'
			}));

			this.views.first('#admin-menu-manager-menu').render();
			this.initSortable(this.isEditing);
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'addCustomItem', function (view) {
			this.views.first('#admin-menu-manager-menu').collection.add(new _menuItem2.default({
				'0': 'Custom item',
				'1': 'read',
				'2': 'custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1, // todo: count instead of random
				'4': 'wp-not-current-submenu menu-top toplevel_page_custom',
				'5': 'custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1,
				'href': '#custom-item-' + Math.floor(Math.random() * (100 - 1)) + 1 // todo: allow for custom URLs
			}));

			this.views.first('#admin-menu-manager-menu').render();
			this.initSortable(this.isEditing);
		});

		// Allow for undo/redo
		this.undoManager = new Backbone.UndoManager({
			register: [this.views.first('#admin-menu-manager-menu').collection, this.views.first('#admin-menu-manager-trash-view').collection],
			track: true
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'undo', function (view) {
			this.undoManager.undo(true);
			this.views.first('#admin-menu-manager-menu').render();
			this.views.first('#admin-menu-manager-trash-view').render();
			this.initSortable(this.isEditing);
		});

		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'redo', function (view) {
			this.undoManager.redo(true);
			this.views.first('#admin-menu-manager-menu').render();
			this.views.first('#admin-menu-manager-trash-view').render();
			this.initSortable(this.isEditing);
		});

		// Listen to the cancel event
		this.listenTo(this.views.first('#admin-menu-manager-edit'), 'cancel', function () {
			this.toggleSortable(false);

			this.views.first('#admin-menu-manager-menu').isEditing = false;
			this.views.first('#admin-menu-manager-menu').collection.reset(AdminMenuManager.menu);
			this.views.first('#admin-menu-manager-trash-view').collection.reset(AdminMenuManager.trash);
		});
	},

	/**
  * Event listener for the edit button.
  *
  * Toggles the jQuery UI Sortable disabled state.
  *
  * @param {boolean} isActive Whether we are currently editing the menu or not.
  */
	toggleSortable: function toggleSortable(isActive) {
		this.isEditing = isActive;
		this.initSortable(isActive);
	},

	/**
  * Initialize jQuery UI Sortable.
  *
  * This happens after each rendering, due to new elements being added.
  *
  * @param {boolean} isEditing Whether we are currently editing the menu or not.
  */
	initSortable: function initSortable(isEditing) {
		// Default sortable options
		var options = {
			// If defined, the items can be dragged only horizontally or vertically. Possible values: "x", "y".
			axis: 'y',
			// Disables the sortable if set to true.
			disabled: !isEditing,
			// Specifies which items inside the element should be sortable.
			items: '> li, .wp-submenu > li:not(.wp-first-item)',
			// Prevents sorting if you start on elements matching the selector.
			cancel: '#collapse-menu, #admin-menu-manager-edit, .amm-edit-options, .amm-is-editing',
			// A selector of other sortable elements that the items from this list should be connected to.
			connectWith: '#amm-adminmenu ul',
			// A class name that gets applied to the otherwise white space.
			placeholder: 'menu-top',
			// This event is triggered when the user stopped sorting and the DOM position has changed.
			update: this.sortableUpdate,
			stop: this.sortableStop
		};

		// Main admin menu
		this.$el.find('#amm-adminmenu').sortable(_.extend(options, { connectWith: '.wp-submenu, #admin-menu-manager-trash' })).sortable('refresh');

		var that = this;
		this.$el.find('.menu-top').droppable({
			drop: function drop(e, ui) {
				if (!that.dropReceiver) {
					that.dropReceiver = jQuery(this).find('.wp-submenu');
				}
			}
		});

		// Trash
		this.$el.find('#admin-menu-manager-trash').sortable(_.extend(options, { connectWith: '#amm-adminmenu, .wp-submenu' })).sortable('refresh');

		if (!isEditing) {
			// somehow it doesn't apply this class even if it's initially disabled
			this.$el.find('.ui-sortable').addClass('ui-sortable-disabled');
		}

		// Trigger the WordPress admin menu resize event
		jQuery(document).trigger('wp-window-resized.pin-menu');

		// Trigger the SVG painter
		wp.svgPainter.init();
	},

	sortableStop: function sortableStop(e, ui) {
		if (this.dropReceiver) {
			this.dropReceiver.append(ui.item);
			this.dropReceiver = null;
			this.sortableUpdate(e, ui);
		}
	},

	/**
  * This is triggered after an element has been successfully sorted.
  *
  * @param {event} e
  * @param {object} ui
  */
	sortableUpdate: function sortableUpdate(e, ui) {
		var itemId = ui.item.attr('data-id'),
		    newPosition = [ui.item.index()];

		// It's a submenu item
		if (ui.item.parent('.wp-submenu').length > 0) {
			newPosition[0] = newPosition[0] > 0 ? --newPosition[0] : 0;
			var parentPosition = jQuery('#amm-adminmenu').find('> li').index(ui.item.parents('li'));
			newPosition.unshift(parentPosition);
		}

		if (newPosition[0] === -1) {
			return;
		}

		/**
   * Iterate through the admin menu object.
   *
   * Find the item's last position and move it to the new one.
   */
		var item = this.views.first('#admin-menu-manager-menu').collection.getRecursively(itemId) || this.views.first('#admin-menu-manager-trash-view').collection.getRecursively(itemId);

		if (!item) {
			return;
		}

		// Get the item object from the old position
		item.collection.remove(item);

		// Move it to the new position
		if (ui.item.parent('#admin-menu-manager-trash').length > 0) {
			// Item was trashed
			this.views.first('#admin-menu-manager-trash-view').collection.add(item, { at: newPosition[0] });
		} else if (newPosition.length === 1) {
			// Item was moved to the top level
			this.views.first('#admin-menu-manager-menu').collection.add(item, { at: newPosition[0] });
		} else if (newPosition.length === 2) {
			// Item was moved to a submenu
			this.views.first('#admin-menu-manager-menu').collection.at(newPosition[0]).children.add(item, { at: newPosition[1] });

			this.views.first('#admin-menu-manager-menu').collection.parseModels();

			/**
    * Reset parent view as this doesn't trigger a reset.
    *
    * Todo: Add listener to subview instead.
    */
			this.views.first('#admin-menu-manager-menu').reset();
		}

		// Re-bind hoverIntent
		this.hoverIntent();

		// Re-init jQuery UI Sortable
		this.initSortable(this.isEditing);
	},

	/**
  * Initialize the hoverIntent jQuery plugin.
  *
  * This happens after each rendering, due to new elements being added.
  *
  * @see /wp-admin/js/common.js for the source of this.
  */
	hoverIntent: function hoverIntent() {
		/**
   * Ensure an admin submenu is within the visual viewport.
   *
   * @see WordPres 4.1.0
   *
   * @param {object} $menuItem The parent menu item containing the submenu.
   */
		function adjustSubmenu($menuItem) {
			var $window = jQuery(window);
			var $wpwrap = jQuery('#wpwrap');
			var $submenu = $menuItem.find('.wp-submenu');
			var menutop = $menuItem.offset().top;
			var wintop = $window.scrollTop();
			var maxtop = menutop - wintop - 30; // max = make the top of the sub almost touch admin bar
			var bottomOffset = menutop + $submenu.height() + 1; // Bottom offset of the menu
			var pageHeight = $wpwrap.height(); // Height of the entire page
			var theFold = $window.height() + wintop - 50; // The fold
			var adjustment = 60 + bottomOffset - pageHeight;

			if (theFold < bottomOffset - adjustment) {
				adjustment = bottomOffset - theFold;
			}

			if (adjustment > maxtop) {
				adjustment = maxtop;
			}

			if (adjustment > 1) {
				$submenu.css('margin-top', '-' + adjustment + 'px');
			} else {
				$submenu.css('margin-top', '');
			}
		}

		var $adminmenu = this.$el.find('#adminmenu');
		$adminmenu.find('li.menu-top').hoverIntent({
			over: function over() {
				var $menuItem = jQuery(this);
				var $submenu = $menuItem.find('.wp-submenu');
				var top = parseInt($submenu.css('top'), 10);

				if (isNaN(top) || top > -5) {
					// the submenu is visible
					return;
				}

				if ($adminmenu.data('wp-responsive')) {
					// The menu is in responsive mode, bail
					return;
				}

				adjustSubmenu($menuItem);
				$adminmenu.find('li.opensub').removeClass('opensub');
				$menuItem.addClass('opensub');
			},

			out: function out() {
				if ($adminmenu.data('wp-responsive')) {
					// The menu is in responsive mode, bail
					return;
				}

				jQuery(this).removeClass('opensub').find('.wp-submenu').css('margin-top', '');
			},

			timeout: 200,
			sensitivity: 7,
			interval: 90
		});
	}
}); // Create the view for the admin bar
exports.default = AppView;

},{"../collections/menu":2,"../models/menu-item":3,"../templates/app.html":4,"./../../../../assets/js/src/views/edit-modal":15,"./../../../../assets/js/src/views/export-modal":16,"./../../../../assets/js/src/views/import-modal":17,"./adminmenu":10,"./collapse-button":12,"./edit-button":14,"./trash":20}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _collapseButton = require('../templates/collapse-button.html');

var _collapseButton2 = _interopRequireDefault(_collapseButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CollapseButton = Backbone.View.extend({
	tagName: 'li',
	template: _collapseButton2.default,
	attributes: function attributes() {
		return {
			class: 'ui-sortable-handle',
			id: 'collapse-menu'
		};
	},

	render: function render() {
		this.$el.html(this.template(AdminMenuManager.templates.collapseButton));
		return this;
	},

	events: {
		'click #collapse-menu': 'collapse'
	},

	collapse: function collapse() {
		this.trigger('collapse');
	}

});

exports.default = CollapseButton;

},{"../templates/collapse-button.html":5}],13:[function(require,module,exports){
'use strict';

var MenuItemView = require("./../../../../assets/js/src/views/menu-item");

var CollectionView = Backbone.View.extend({
	// Can't be named views because wp.Backbone would think it's a wp.Backbone subview.
	_views: [],

	/**
  * Initializes a collection view.
  *
  * The collection's model views are generated one by one and rendered afterwards as a whole.
  *
  * When updating the collection, i.e. by sorting, the menu needs to be reset and built from scratch.
  *
  * Ideally, we would use a comparator to sort the models based on their appearance in the menu.
  *
  * @class CollectionView
  * @augments Backbone.View
  * @constructs CollectionView object
  *
  * @param {Array} options
  */
	initialize: function initialize(options) {
		this.options = options;

		// Ensure our methods keep the `this` reference to the view itself
		_.bindAll(this, 'render', 'add', 'remove', 'reset');

		this.collection.each(this.add);

		// Bind collection changes to re-rendering
		this.collection.on('add', this.reset);
		this.collection.on('remove', this.reset);
		this.collection.on('reset', this.reset);
	},

	/**
  * Renders the collection.
  *
  * @returns {CollectionView}
  */
	render: function render() {
		this.$el.empty();

		_.each(this._views, function (view) {
			this.$el.append(view.render().el);
		}, this);

		this.delegateEvents();

		return this;
	},

	/**
  * Adds a model to the collection view.
  *
  * @param {MenuItem} model
  */
	add: function add(model) {
		var menuItemView = new MenuItemView({
			model: model,
			parent: this
		});

		this._views.push(menuItemView);

		return this;
	},

	/**
  * Resets the whole collection view.
  */
	reset: function reset() {
		this._views = [];

		this.collection.each(this.add);
		this.render();

		return this;
	}
});

module.exports = CollectionView;

},{"./../../../../assets/js/src/views/menu-item":18}],14:[function(require,module,exports){
'use strict';

var _editButton = require('../templates/edit-button.html');

var _editButton2 = _interopRequireDefault(_editButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditButton = Backbone.View.extend({
	id: 'admin-menu-manager-edit',
	tagName: 'li',
	template: _editButton2.default,
	isActive: false,

	render: function render() {
		this.$el.html(this.template(AdminMenuManager.templates.editButton));
		this.delegateEvents();
		return this;
	},

	events: {
		'click #amm-edit-menu': 'edit',
		'click #amm-edit-option-save': 'save',
		'click #amm-edit-option-add': 'add',
		'click #amm-edit-option-add-separator': 'addSeparator',
		'click #amm-edit-option-add-custom': 'addCustomItem',
		'click #amm-edit-option-add-import': 'import',
		'click #amm-edit-option-add-export': 'export',
		'click #amm-edit-option-undo': 'undo',
		'click #amm-edit-option-redo': 'redo',
		'click #amm-edit-option-reset': 'reset',
		'click #amm-edit-option-cancel': 'cancel'
	},

	edit: function edit(e) {
		e.preventDefault();

		this.initEditing();
	},

	initEditing: function initEditing() {
		this.isActive = !this.isActive;

		this.trigger('active', this.isActive);
		this.$el.toggleClass('active', this.isActive);
	},

	save: function save(e) {
		e.preventDefault();

		this.isActive = !this.isActive;

		this.trigger('active', this.isActive);
		this.$el.toggleClass('active', this.isActive);
		this.trigger('save', this);
	},

	add: function add(e) {
		e.preventDefault();

		this.$el.find('#amm-edit-option-add + .amm-edit-option-choices').toggleClass('hidden');

		// Trigger the WordPress admin menu resize event
		jQuery(document).trigger('wp-window-resized.pin-menu');
	},

	addSeparator: function addSeparator(e) {
		e.preventDefault();

		this.trigger('addSeparator', this);
	},

	addCustomItem: function addCustomItem(e) {
		e.preventDefault();

		this.trigger('addCustomItem', this);
	},

	import: function _import(e) {
		e.preventDefault();
		this.trigger('import', this);
	},

	export: function _export(e) {
		e.preventDefault();
		this.trigger('export', this);
	},

	undo: function undo(e) {
		e.preventDefault();
		this.trigger('undo', this);
	},

	redo: function redo(e) {
		e.preventDefault();
		this.trigger('redo', this);
	},

	reset: function reset(e) {
		e.preventDefault();
		this.trigger('reset');
	},

	cancel: function cancel(e) {
		e.preventDefault();

		this.isActive = false;

		this.trigger('cancel');
		this.$el.toggleClass('active', this.isActive);
	}
});

module.exports = EditButton;

},{"../templates/edit-button.html":6}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _editModal = require('../templates/edit-modal.html');

var _editModal2 = _interopRequireDefault(_editModal);

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditModal = _modal2.default.extend({
	template: _editModal2.default,
	isActive: false,

	initialize: function initialize(options) {
		this.options = options;

		this.options.templateData = AdminMenuManager.templates.editModal;
		this.options.templateData.model = this.model.toJSON();

		_.bindAll(this, 'render');
	},

	render: function render() {
		this.$el.html(this.template(this.options.templateData));
		this.$el.find('.dashicons-picker').dashiconsPicker();

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
		'click #amm-modal-toolbar-button': 'save'
	},

	close: function close(e) {
		this.$el.find('.dashicons-picker').trigger('mouseup');

		_modal2.default.prototype.close.call(this);
	},

	save: function save() {
		this.model.set(0, this.$el.find('input[name=amm-menu-item-option-name]').val());
		this.model.set(6, this.$el.find('input[name=amm-menu-item-option-icon]').val());
		this.model.set('href', this.$el.find('input[name=amm-menu-item-option-href]').val());

		this.remove();

		this.trigger('save');
	}
});

exports.default = EditModal;

},{"../templates/edit-modal.html":7,"./modal":19}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _modal = require('../templates/modal.html');

var _modal2 = _interopRequireDefault(_modal);

var _modal3 = require('./modal');

var _modal4 = _interopRequireDefault(_modal3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExportModal = _modal4.default.extend({
	template: _modal2.default,
	isActive: false,

	initialize: function initialize(options) {
		this.options = options;

		this.options.templateData = AdminMenuManager.templates.exportModal;
		this.options.templateData.content = this.options.content;

		_.bindAll(this, 'render');
	},

	render: function render() {
		this.$el.html(this.template(this.options.templateData));
		this.$el.find('#amm-modal-toolbar-button').removeAttr('disabled');

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
		'click #amm-modal-toolbar-button': 'close',
		'focus #amm-modal-textarea': 'selectText'
	},

	close: function close(e) {
		e.preventDefault();

		this.trigger('close', this);
		this.remove();
	},

	selectText: function selectText(e) {
		jQuery(e.target).select();
	}

});

exports.default = ExportModal;

},{"../templates/modal.html":9,"./modal":19}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _modal = require('../templates/modal.html');

var _modal2 = _interopRequireDefault(_modal);

var _modal3 = require('./modal');

var _modal4 = _interopRequireDefault(_modal3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImportModal = _modal4.default.extend({
	template: _modal2.default,
	isActive: false,

	initialize: function initialize(options) {
		this.options = options || {};

		this.options.templateData = AdminMenuManager.templates.importModal;
		this.options.templateData.content = '';

		_.bindAll(this, 'render');
	},

	render: function render() {
		this.$el.html(this.template(this.options.templateData));

		this.delegateEvents();

		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
		'click #amm-modal-toolbar-button': 'import',
		'input #amm-modal-textarea': 'enableButton'
	},

	close: function close(e) {
		e.preventDefault();

		this.trigger('close', this);
		this.remove();
	},

	import: function _import() {
		this.trigger('import', this.$el.find('#amm-modal-textarea').val());
		this.remove();
	},

	enableButton: function enableButton(e) {
		if (e.target.value.length) {
			this.$el.find('#amm-modal-toolbar-button').removeAttr('disabled');
		} else {
			this.$el.find('#amm-modal-toolbar-button').attr('disabled', 'disabled');
		}
	}

});

exports.default = ImportModal;

},{"../templates/modal.html":9,"./modal":19}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _menuItem = require('../templates/menu-item.html');

var _menuItem2 = _interopRequireDefault(_menuItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MenuItemView = Backbone.View.extend({
	tagName: 'li',
	template: _menuItem2.default,
	optionsActive: false,
	attributes: function attributes() {
		// Return model data
		return {
			class: this.model.get(4),
			id: this.model.get(5),
			'aria-hidden': this.model.get(4).indexOf('wp-menu-separator') > -1,
			'data-id': this.model.id
		};
	},

	initialize: function initialize(attributes, options) {
		this.parent = attributes.parent;
	},

	render: function render() {
		if (this.model.get(4).indexOf('wp-menu-separator') > -1) {
			this.template = _.template('<div class="separator"></div>');
		}

		this.$el.html(this.template(this.model.toJSON()));
		this.delegateEvents();

		return this;
	},

	events: {
		'click a': 'editMenuItem'
	},

	editMenuItem: function editMenuItem(e) {
		if (!this.parent.isEditing) {
			return;
		}

		var $target = jQuery(e.target).parents('[data-id]').first(),
		    slug = $target.attr('data-id').replace('&', '&#038;'),
		    model = void 0;

		if (this.model.get(2) === slug) {
			model = this.model;
		} else {
			// It's a sub menu item.
			model = _.find(this.model.children.models, function (el) {
				return el.get(2) === slug;
			});
		}

		if (!model) {
			return;
		}

		e.preventDefault();

		Backbone.trigger('editItem', this, model);
	}
});

exports.default = MenuItemView;

},{"../templates/menu-item.html":8}],19:[function(require,module,exports){
'use strict';

var _modal = require('../templates/modal.html');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = Backbone.View.extend({
	id: 'admin-menu-manager-modal',
	template: _modal2.default,
	isActive: false,

	initialize: function initialize(options) {
		this.options = options;
		_.bindAll(this, 'render');
	},

	render: function render() {
		this.$el.html(this.template(this.options.templateData));
		this.delegateEvents();
		return this;
	},

	events: {
		'click #amm-modal-close': 'close',
		'keydown': 'keydownHandler'
	},

	/**
  * Handle esc key presses.
  *
  * @param {Event} e Event object.
  */
	keydownHandler: function keydownHandler(e) {
		if (27 === e.keyCode) {
			this.close(e);
		} else if (9 === e.keyCode) {
			this.constrainTabbing(e);
		}
	},

	/**
  * Constrain tabbing within the modal.
  *
  * @param {Event} e Event object.
  */
	constrainTabbing: function constrainTabbing(e) {
		var title = this.$el.find('#amm-modal-title'),
		    primaryButton = this.$el.find('#amm-modal-toolbar-button'),
		    closeButton = this.$el.find('#amm-modal-close');

		if (closeButton[0] === e.target) {
			if (e.shiftKey) {
				primaryButton.focus();
			} else {
				title.focus();
			}
			e.preventDefault();
		} else if (title[0] === e.target && e.shiftKey) {
			closeButton.focus();
			e.preventDefault();
		} else if (primaryButton[0] === e.target && !e.shiftKey) {
			closeButton.focus();
			e.preventDefault();
		}
	},

	/**
  * Closes the modal.
  *
  * @param {Event} e Event object.
  */
	close: function close(e) {
		e.preventDefault();

		this.trigger('close', this);
		this.remove();
	}
}, {
	extend: function extend(protoProps, staticProps) {
		var parent = this;

		protoProps.events = _.extend({}, parent.prototype.events ? parent.prototype.events : {}, protoProps.events ? protoProps.events : {});

		return Backbone.View.extend.apply(parent, arguments);
	}
});

module.exports = Modal;

},{"../templates/modal.html":9}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _collectionview = require('./collectionview');

var _collectionview2 = _interopRequireDefault(_collectionview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Trash = _collectionview2.default.extend({
	tagName: 'ul',
	id: 'admin-menu-manager-trash',
	className: 'dashicons-before dashicons-trash',

	/**
  * Initialize the trashed admin menu.
  *
  * @class AdminMenu
  * @augments Backbone.View
  * @constructs AdminMenu object
  */
	initialize: function initialize(options) {
		_collectionview2.default.prototype.initialize.apply(this, [options]);

		this.collection.reset(AdminMenuManager.trash);
	}

});

exports.default = Trash;

},{"./collectionview":13}]},{},[1]);
