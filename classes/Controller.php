<?php
/**
 * Main plugin functionality.
 *
 * @package Admin_Menu_Manager
 */

namespace Required\Admin_Menu_Manager;

/**
 * Admin_Menu_Manager_Plugin class.
 */
class Controller {
	/**
	 * Plugin version.
	 */
	const VERSION = '2.0.0-alpha';

	/**
	 * The full path and filename of the main plugin file.
	 *
	 * @var string
	 */
	protected $file;

	/**
	 * @var \Required\Admin_Menu_Manager\Data_Provider
	 */
	protected $data_provider;

	/**
	 * @var \Required\Admin_Menu_Manager\Ajax_Handler
	 */
	protected $ajax_handler;

	/**
	 * Controller constructor.
	 *
	 * @param string $file The full path and filename of the main plugin file.
	 */
	public function __construct( $file ) {
		$this->file = $file;

		$this->ajax_handler  = new Ajax_Handler();
		$this->data_provider = new Data_Provider();
	}

	/**
	 * Adds hooks.
	 */
	public function add_hooks() {
		// Load the plugin textdomain.
		add_action( 'init', [ $this, 'load_textdomain' ] );

		// Load admin CSS and JavaScript.
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 5 );

		// Handle form submissions.
		add_action( 'wp_ajax_adminmenu', [ $this->ajax_handler, 'receive' ] );

		// Modify admin menu.
		add_action( 'admin_menu', [ $this, 'alter_admin_menu' ], 999 );

		// Tell WordPress we're changing the menu order.
		add_filter( 'custom_menu_order', '__return_true' );

		// Add our filter way later, after other plugins have defined the menu.
		add_action( 'menu_order', [ $this, 'alter_admin_menu_order' ], 9999 );
	}

	/**
	 * Returns the URL to the plugin directory (with trailing slash).
	 *
	 * @return string The URL to the plugin directory.
	 */
	public function get_url() {
		return plugin_dir_url( $this->file );
	}

	/**
	 * Initializes the plugin, registers textdomain, etc.
	 *
	 * @return bool True if the textdomain was loaded successfully, false otherwise.
	 */
	public function load_textdomain() {
		return load_plugin_textdomain( 'admin-menu-manager' );
	}

	/**
	 * Load our JavaScript and CSS if the user has enough capabilities to edit the menu.
	 */
	public function admin_enqueue_scripts() {
		if (
			is_network_admin() ||
			is_customize_preview() ||
			/**
			 * Filter whether the user is allowed to change the menu.
			 *
			 * Defaults to true if the user has the permission to read posts.
			 *
			 * @since 2.0.0
			 *
			 * @param bool $can_change_menu Whether the user can change the menu.
			 */
			! (bool) apply_filters( 'amm_user_can_change_menu', current_user_can( 'read' ) )
		) {
			return;
		}

		// Use minified libraries if SCRIPT_DEBUG is turned off.
		$suffix = SCRIPT_DEBUG ? '' : '.min';

		wp_register_style(
			'dashicons-picker',
			$this->get_url() . 'css/vendor/dashicons-picker.css',
			[],
			'935c8be'
		);

		wp_enqueue_style( 'admin-menu-manager', $this->get_url() . 'css/admin-menu-manager' . $suffix . '.css', [ 'dashicons-picker' ], self::VERSION );

		wp_add_inline_style( 'admin-menu-manager', $this->get_inline_style() );

		wp_register_script(
			'backbone-undo',
			$this->get_url() . 'js/vendor/backbone.undo.min.js',
			[ 'backbone' ],
			'0.2'
		);

		wp_register_script(
			'dashicons-picker',
			$this->get_url() . 'js/vendor/dashicons-picker.js',
			[ 'jquery' ],
			'935c8be'
		);

		wp_enqueue_script(
			'admin-menu-manager',
			$this->get_url() . 'js/admin-menu-manager' . $suffix . '.js',
			[
				'jquery-ui-sortable',
				'jquery-ui-droppable',
				'wp-backbone',
				'backbone-undo',
				'dashicons-picker',
			],
			self::VERSION
		);

		wp_localize_script( 'admin-menu-manager', 'AdminMenuManager', $this->data_provider->get_data() );
	}

	/**
	 * Get the inline stylesheet if available.
	 *
	 * Returns false if the current color scheme isn't set.
	 *
	 * @return string|false
	 */
	protected function get_inline_style() {
		global $_wp_admin_css_colors;

		$current_color = get_user_option( 'admin_color' );

		if ( isset( $_wp_admin_css_colors[ $current_color ] ) ) {
			$border     = $_wp_admin_css_colors[ $current_color ]->icon_colors['base'];
			$background = $_wp_admin_css_colors[ $current_color ]->colors[0];
			$base       = $_wp_admin_css_colors[ $current_color ]->icon_colors['base'];
			$focus      = $_wp_admin_css_colors[ $current_color ]->icon_colors['focus'];
			$current    = $_wp_admin_css_colors[ $current_color ]->icon_colors['current'];

			return "
			.amm-edit-option-choices { background-color: $border; }
			.amm-edit-option-choices:after { border-bottom-color: $border; }
			#admin-menu-manager-trash,
			#amm-adminmenu:not(.ui-sortable-disabled) .wp-menu-separator.ui-sortable-handle { background-color: $background; border-color: $border !important; }
			#admin-menu-manager-edit > .menu-top,
			#admin-menu-manager-edit > .menu-top div.wp-menu-image:before,
			.amm-edit-option a { color: $base; !important }
			#admin-menu-manager-edit .menu-top:focus,
			#admin-menu-manager-edit .menu-top:focus div.wp-menu-image:before { color: $focus !important; }
			.amm-edit-option a:hover { color: $current !important; }
			";
		}

		return false;
	}

	/**
	 * Grab a list of all registered admin pages.
	 *
	 * @since 1.0.0
	 *
	 * @return array Top level menu items.
	 */
	public function get_admin_menu() {
		global $menu;

		$menu_items = [];

		foreach ( (array) $menu as $menu_item ) {
			$menu_items[] = $this->get_admin_menu_item( $menu_item );
		}

		return $menu_items;
	}

	/**
	 * Get the menu item slug without any query param.
	 *
	 * @param string $slug Menu item slug.
	 *
	 * @return string
	 */
	protected function get_menu_item_file( $slug ) {
		$pos = strpos( $slug, '?' );

		if ( false !== $pos ) {
			$slug = substr( $slug, 0, $pos );
		}

		return $slug;
	}

	/**
	 * Prepare a top-level menu item.
	 *
	 * @param array $menu_item A single menu item.
	 *
	 * @return array
	 */
	protected function get_admin_menu_item( $menu_item ) {
		$menu_file = $this->get_menu_item_file( $menu_item[2] );

		if ( file_exists( WP_PLUGIN_DIR . "/$menu_file" ) && ! file_exists( ABSPATH . "/wp-admin/$menu_file" ) ) {
			$menu_item['is_plugin_item'] = true;
		}

		$children = $this->get_admin_menu_sub_items( $menu_item, $menu_file );

		if ( $children ) {
			$menu_item['children'] = $children;
		}

		return $menu_item;
	}

	/**
	 * Determines whether a given file exists in the plugin directory but not in wp-admin.
	 *
	 * @param string $menu_file Menu file name.
	 *
	 * @return bool
	 */
	protected function is_plugin_file_but_not_admin_file( $menu_file ) {
		return file_exists( WP_PLUGIN_DIR . "/$menu_file" ) &&
		       ! file_exists( ABSPATH . "/wp-admin/$menu_file" );
	}

	/**
	 * Get the children of a top-level menu item.
	 *
	 * @param array  $menu_item A single menu-item.
	 * @param string $menu_file The parent menu item's slug.
	 *
	 * @return array The list of sub menu items.
	 */
	protected function get_admin_menu_sub_items( $menu_item, $menu_file ) {
		global $submenu;

		if ( empty( $submenu[ $menu_item[2] ] ) ) {
			return [];
		}

		$children        = [];
		$admin_is_parent = false;

		$submenu_items = array_values( $submenu[ $menu_item[2] ] );  // Re-index.
		$menu_hook     = get_plugin_page_hook( $submenu_items[0][2], $menu_item[2] );

		if (
			! empty( $menu_hook ) ||
			(
				'index.php' !== $submenu_items[0][2] &&
				$this->is_plugin_file_but_not_admin_file( $menu_file )
			)
		) {
			$admin_is_parent = true;
		}

		foreach ( $submenu[ $menu_item[2] ] as $sub_item ) {
			$sub_file = $this->get_menu_item_file( $sub_item[2] );

			$menu_hook = get_plugin_page_hook( $sub_item[2], $menu_item[2] );

			if (
				(
					! empty( $menu_hook ) ||
					(
						'index.php' !== $sub_item[2] &&
						$this->is_plugin_file_but_not_admin_file( $sub_file )
					)
				) &&
				// If admin.php is the current page or if the parent exists as a file in the plugins or admin dir.
				(
					file_exists( $menu_file ) ||
					(
						! $admin_is_parent &&
						file_exists( WP_PLUGIN_DIR . "/$menu_file" ) &&
						! is_dir( WP_PLUGIN_DIR . "/{$menu_item[2]}" )
					)
				)
			) {
				$sub_item['inherit_parent'] = true;
			}

			$children[] = $sub_item;
		}

		return $children;
	}

	/**
	 * Grab a list of all trashed admin menu items.
	 *
	 * @return array
	 */
	public function get_admin_menu_trash() {
		$menu    = $this->get_menu_data( 'amm_trash_menu' );
		$submenu = $this->get_menu_data( 'amm_trash_submenu' );

		$menu_items = [];

		foreach ( $menu as $menu_item ) {
			if ( ! empty( $submenu[ $menu_item[2] ] ) ) {
				foreach ( $submenu[ $menu_item[2] ] as $key => &$value ) {
					if ( '' === $key && '' === $value[0] ) {
						unset( $submenu[ $menu_item[2] ][ $key ] );

						continue;
					}

					$value[] = $key;
				}

				$menu_item['children'] = array_values( $submenu[ $menu_item[2] ] );
			}

			$menu_items[] = $menu_item;
		}

		return $menu_items;
	}

	/**
	 * Get menu data from database.
	 *
	 * @param string $type Menu type.
	 *
	 * @return array
	 */
	protected function get_menu_data( $type ) {
		$menu_data = [];
		switch ( $type ) {
			case 'menu':
				$menu_data = get_user_option( 'amm_menu' );

				if ( ! $menu_data ) {
					$menu_data = get_option( 'amm_menu', [] );
				}
				break;
			case 'submenu':
				$menu_data = get_user_option( 'amm_submenu' );

				if ( ! $menu_data ) {
					$menu_data = get_option( 'amm_submenu', [] );
				}
				break;
			case 'trash_menu':
				$menu_data = get_user_option( 'amm_trash_menu' );
				break;
			case 'trash_submenu':
				$menu_data = get_user_option( 'amm_trash_submenu' );
				break;
		}

		if ( false === $menu_data ) {
			$menu_data = [];
		}

		/**
		 * Filter the menu data.
		 *
		 * @since 2.0.0
		 *
		 * @param array  $menu_data The menu data.
		 * @param string $type Either 'trash' or 'menu'.
		 */
		return (array) apply_filters( 'amm_menu_data', $menu_data, $type );
	}

	/**
	 * Here's where the magic happens!
	 *
	 * Compare our menu structure with the original.
	 * Essentially it uses the new order but with the original values,
	 * so translated strings and icons still work.
	 *
	 * 0 = menu_title, 1 = capability, 2 = menu_slug, 3 = page_title, 4 = classes
	 */
	public function alter_admin_menu() {
		$amm_menu          = $this->get_menu_data( 'menu' );
		$amm_submenu       = $this->get_menu_data( 'submenu' );
		$amm_trash_menu    = $this->get_menu_data( 'trash_menu' );
		$amm_trash_submenu = $this->get_menu_data( 'trash_submenu' );

		// Bail early when there's no custom menu data.
		if ( empty( $amm_menu ) || empty( $amm_submenu ) ) {
			return;
		}

		global $menu, $submenu, $admin_page_hooks, $_registered_pages, $temp_menu, $temp_submenu;

		$temp_menu    = array_values( $menu ); // Do not preserve keys.
		$temp_submenu = $submenu;
		$temp_hooks   = $admin_page_hooks;

		$menu = $submenu = $_registered_pages = null;

		$menu_iterator = new Parent_Menu_Iterator( $amm_menu, $temp_menu, $temp_submenu );
		$menu_iterator->maybe_match_menu_items();

		$admin_page_hooks = $this->keep_admin_page_hooks( $admin_page_hooks, $temp_hooks );

		// Iterate on all our submenu items.
		$menu_iterator = new Sub_Menu_Iterator( $amm_menu, $temp_menu, $amm_submenu, $temp_submenu );
		$menu_iterator->maybe_match_menu_items();

		$this->trash_menu_items( $amm_trash_menu );
		$this->trash_submenu_items( $amm_trash_submenu );

		/*
		 * Append elements that haven't been added to a menu yet.
		 *
		 * This happens when installing a new plugin for example.
		 */
		$menu = array_merge( $menu, $temp_menu );

		// Move old submenu items to the new submenu array.
		$this->move_submenu_items();
	}

	/**
	 * Move old submenu items to the new submenu array.
	 *
	 * They may not have been added to the submenu yet, which happens when installing a new plugin for example.
	 */
	protected function move_submenu_items() {
		global $temp_submenu, $submenu, $_registered_pages;

		foreach ( $temp_submenu as $parent => $items ) {
			if ( '' === $parent || empty( $items ) || ! is_array( $items ) ) {
				continue;
			}

			// Do not preserve keys.
			$items = array_values( $items );

			if ( ! isset( $submenu[ $parent ] ) ) {
				$submenu[ $parent ] = [];
			}

			foreach ( $items as $s_item ) {
				$_registered_pages[ get_plugin_page_hookname( $s_item[2], $parent ) ] = true;

				$submenu[ $parent ][] = $s_item;
			}
		}
	}

	/**
	 * Moves menu items to the trash.
	 *
	 * @param array $items The menu items.
	 */
	protected function trash_menu_items( $items ) {
		// Remove trashed items.
		foreach ( $items as $item ) {
			$this->trash_menu_item( $item );
		}
	}

	/**
	 * Moves submenu items to the trash.
	 *
	 * @param array $items The menu items.
	 */
	protected function trash_submenu_items( $items ) {
		// Remove trashed items.
		foreach ( $items as $parent_page => $page ) {
			$this->trash_submenu_item( $page, $parent_page );
		}
	}

	/**
	 * Moves a single menu item to the trash.
	 *
	 * @param array $item The menu item.
	 */
	protected function trash_menu_item( $item ) {
		global $temp_menu, $temp_submenu;
		// It was originally a top level item as well. It's a match!
		foreach ( $temp_menu as $key => $m_item ) {
			if ( $item[2] === $m_item[2] ) {
				unset( $temp_menu[ $key ] );

				return;
			}
		}

		// It must be a submenu item moved to the top level.
		foreach ( $temp_submenu as $key => $parent ) {
			foreach ( $parent as $sub_key => $sub_item ) {
				if ( $item[2] === $sub_item[2] ) {
					unset( $temp_submenu[ $key ][ $sub_key ] );

					return;
				}
			}
		}
	}

	/**
	 * Moves a single submenu item to the trash.
	 *
	 * @param array $page        The submenu item.
	 * @param int   $parent_page The item's parent.
	 */
	protected function trash_submenu_item( $page, $parent_page ) {
		global $temp_menu, $temp_submenu;

		foreach ( $page as $item ) {
			// Iterate on original submenu items.
			foreach ( $temp_submenu as $s_parent_page => $s_page ) {
				foreach ( $s_page as $s_priority => $s_item ) {
					if ( $item[2] === $s_item[2] && $parent_page === $s_parent_page ) {
						unset( $temp_submenu[ $s_parent_page ][ $s_priority ] );
						continue 2;
					}
				}
			}

			// It must be a top level item moved to submenu.
			foreach ( $temp_menu as $m_key => $m_item ) {
				if ( $item[2] === $m_item[2] ) {
					unset( $temp_menu[ $m_key ] );
					continue 2;
				}
			}
		}
	}

	/**
	 * Loop through admin page hooks.
	 *
	 * We want to keep the original, untranslated values.
	 *
	 * @param array $admin_page_hooks An array of admin page hooks.
	 * @param array $temp_hooks       Temporary copy of the first array.
	 * @return array The merged hooks array.
	 */
	protected function keep_admin_page_hooks( $admin_page_hooks, $temp_hooks ) {
		foreach ( $admin_page_hooks as $key => &$value ) {
			if ( isset( $temp_hooks[ $key ] ) ) {
				$value = $temp_hooks[ $key ];
			}
		}

		return $admin_page_hooks;
	}

	/**
	 * Make sure our menu order is kept.
	 *
	 * Some plugins (I'm looking at you, Jetpack!) want to always be on top,
	 * let's fix this.
	 *
	 * @param array $menu_order WordPress admin menu order.
	 *
	 * @return array
	 */
	public function alter_admin_menu_order( $menu_order ) {
		global $menu;

		$amm_menu = $this->get_menu_data( 'amm_menu' );

		if ( ! $amm_menu ) {
			return $menu_order;
		}

		$new_order = [];
		foreach ( $menu as $item ) {
			$new_order[] = $item[2];
		}

		return $new_order;
	}
}
