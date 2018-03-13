import MenuItem from '../models/menu-item';

const Menu = Backbone.Collection.extend( {
	model: MenuItem,

	initialize: function ( models, options ) {
		this.options = this.options || options;

		this.bind( 'reset', this.onReset );
		this.bind( 'add', this.onReset );
		this.bind( 'remove', this.onReset );
	},

	onReset: function () {
		if ( this.length === 0 ) {
			return;
		}

		this.first().set( 4, this.first().get( 4 ) + ' wp-first-item' );

		this.parseModels();
	},

	parseModels: function () {
		this.each( function ( model ) {
			this.parseModel( model );
		}, this );
	},

	parseModel: function ( model ) {
		let self    = location.pathname.split( '/' ).pop();
		let classes = model.get( 4 ).split( ' ' );
		const slug  = model.get( 'href' ) ? model.get( 'href' ) : model.get( 2 );

		// If it's empty then we're most probably on the dashboard.
		if ( '' === self ) {
			self = 'index.php';
		}

		if ( slug.indexOf( 'separator' ) === 0 ) {
			return;
		}

		classes.push( 'menu-top' );

		if ( (AdminMenuManager.parent_file && slug === AdminMenuManager.parent_file) ||
			((!window.typenow) && self === slug)
		) {
			if ( model.children.length ) {
				classes.push( 'wp-has-current-submenu' );
				classes.push( 'wp-menu-open' );
			} else {
				classes.push( 'current' );
			}
		} else {
			classes.push( 'wp-not-current-submenu' );
		}

		if ( !!model.get( 'is_plugin_item' ) || slug.indexOf( '#' ) === -1 && slug.indexOf( '.php' ) === -1 && slug.indexOf( 'http' ) === -1 ) {
			model.set( 'href', 'admin.php?page=' + slug );
		}

		if ( model.children.length ) {
			classes.push( 'wp-has-submenu' );

			model.children.each( function ( child ) {
				const slug     = child.get( 2 );
				let parentHref = this.parent.get( 'href' ) ? this.parent.get( 'href' ) : this.parent.get( 2 );

				if ( parentHref.search( '\\?page=' ) > -1 ) {
					parentHref = parentHref.substr( 0, parentHref.search( '\\?page=' ) );
				}

				if (
					(AdminMenuManager.submenu_file && slug === AdminMenuManager.submenu_file) ||
					(!AdminMenuManager.plugin_page && self === slug && ! window.typenow) ||
					(
						AdminMenuManager.plugin_page && AdminMenuManager.plugin_page === slug &&
						(
							this.parent.get( 2 ) === self + '?post_type=' + window.typenow ||
							parentHref === self ||
							'admin.php' === self
						)
					)
				) {
					child.set( 4, child.get( 4 ) + ' current' );

					// Mark parent as active if child is the current item.
					if ( !_.contains( classes, 'wp-has-current-submenu' ) ) {
						classes.push( 'wp-has-current-submenu' );
						classes.push( 'wp-menu-open' );
					}
				}

				if ( slug.indexOf( 'http' ) >= 0 ) {
					child.set( 'href', slug );
				} else if ( !!child.get( 'inherit_parent' ) ) {
					child.set( 'href', parentHref + '?page=' + slug );
				} else if ( slug.indexOf( '#' ) >= 0 ) {
					child.set( 'href', slug );
				} else if ( slug.indexOf( 'custom-item' ) >= 0 ) {
					child.set( 'href', '#' + slug );
				} else if ( slug.indexOf( '.php' ) >= 0 ) {
					child.set( 'href', slug );
				} else {
					child.set( 'href', 'admin.php?page=' + slug );
				}
			}, { parent: model } );
		}

		if ( _.contains( classes, 'wp-has-current-submenu' ) ) {
			classes = _.without( classes, 'wp-not-current-submenu' );
		}

		model.set( 4, _.uniq( classes ).join( ' ' ) );
	},

	url: function () {
		const type = this.options && this.options.type ? this.options.type : '';
		return ajaxurl + '?action=adminmenu&type=' + type;
	},

	save: function ( callback ) {
		Backbone.sync( 'create', this, {
			success: function () {
				if ( typeof(callback) === typeof(Function) ) {
					callback();
				}
			}
		} );
	},

	destroy: function ( callback ) {
		Backbone.sync( 'delete', this, {
			success: function () {
				if ( typeof(callback) === typeof(Function) ) {
					callback();
				}
			}
		} );
	},

	/**
	 * Returns a model of this collection or a matching child.
	 *
	 * @param {Object} obj
	 * @returns {MenuItem}
	 */
	getRecursively: function ( obj ) {
		const allChildren = _.flatten( this.map( function ( model ) {
			return model.children.length ? [ model.children.models ] : [];
		} ) );

		return this.get( obj ) ||
			_.find( allChildren, function ( model ) {
				return model.id === obj;
			} );
	}
} );

export default Menu;
