<?php
/**
 * Main plugin functionality.
 *
 * @package Admin_Menu_Manager
 */

defined( 'WPINC' ) or die;

/**
 * Admin_Menu_Manager_Plugin class.
 */
class Admin_Menu_Manager_Plugin extends WP_Stack_Plugin2 {
	/**
	 * Instance of this class.
	 *
	 * @var self
	 */
	protected static $instance;

	/**
	 * Plugin version.
	 */
	const VERSION = '2.0.0-alpha';

	/**
	 * Constructs the object, hooks in to `plugins_loaded`.
	 */
	protected function __construct() {
		$this->hook( 'plugins_loaded', 'add_hooks' );
	}

	/**
	 * Adds hooks.
	 */
	public function add_hooks() {
		$this->hook( 'init' );

		// Load admin CSS and JavaScript.
		$this->hook( 'admin_enqueue_scripts', 5 );

		// Handle form submissions.
		$this->hook( 'wp_ajax_adminmenu', 'ajax_handler' );

		// Modify admin menu.
		$this->hook( 'admin_menu', 'alter_admin_menu', 999 );

		// Tell WordPress we're changing the menu order.
		add_filter( 'custom_menu_order', '__return_true' );

		// Add our filter way later, after other plugins have defined the menu.
		$this->hook( 'menu_order', 'alter_admin_menu_order', 9999 );
	}

	/**
	 * Initializes the plugin, registers textdomain, etc.
	 */
	public function init() {
		$this->load_textdomain( 'admin-menu-manager', '/languages' );
	}

	/**
	 * Load our JavaScript and CSS if the user has enough capabilities to edit the menu.
	 */
	public function admin_enqueue_scripts() {
		if ( is_network_admin() || is_customize_preview() ) {
			return;
		}

		if ( ! apply_filters( 'amm_user_can_change_menu', current_user_can( 'read' ) ) ) {
			return;
		}

		// Use minified libraries if SCRIPT_DEBUG is turned off.
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		wp_enqueue_style( 'admin-menu-manager', $this->get_url() . 'css/admin-menu-manager' . $suffix . '.css', array(), self::VERSION );

		wp_add_inline_style( 'admin-menu-manager', $this->get_inline_style() );

		wp_register_script(
			'backbone-undo',
			$this->get_url() . 'js/vendor/backbone.undo.min.js',
			array( 'backbone' ),
			self::VERSION
		);

		wp_enqueue_script(
			'admin-menu-manager',
			$this->get_url() . 'js/admin-menu-manager' . $suffix . '.js',
			array(
				'jquery-ui-sortable',
				'jquery-ui-droppable',
				'wp-backbone',
				'backbone-undo',
			),
			self::VERSION
		);

		wp_localize_script( 'admin-menu-manager', 'AdminMenuManager', $this->get_localize_script_data() );
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
	 * Get the inline script data for use by `wp_localize_script`
	 *
	 * @return array
	 */
	protected function get_localize_script_data() {
		global $parent_file, $submenu_file;

		$plugin_page = null;

		if ( isset( $_GET['page'] ) ) {
			$plugin_page = wp_unslash( $_GET['page'] );
			$plugin_page = plugin_basename( $plugin_page );
		}

		return array(
			'templates'    => array(
				'editButton'      => array(
					'label'       => __( 'Edit Menu', 'admin-menu-manager' ),
					'labelSaving' => __( 'Saving&hellip;', 'admin-menu-manager' ),
					'labelSaved'  => __( 'Saved!', 'admin-menu-manager' ),
					'options'     => array(
						'save'          => __( 'Save changes', 'admin-menu-manager' ),
						'add'           => __( 'Add new item', 'admin-menu-manager' ),
						'addSeparator'  => __( 'Separator', 'admin-menu-manager' ),
						'addCustomItem' => __( 'Custom item', 'admin-menu-manager' ),
						'addImport'     => __( 'Import', 'admin-menu-manager' ),
						'addExport'     => __( 'Export', 'admin-menu-manager' ),
						'undo'          => __( 'Undo change', 'admin-menu-manager' ),
						'redo'          => __( 'Redo change', 'admin-menu-manager' ),
						'reset'         => __( 'Reset menu', 'admin-menu-manager' ),
					),
				),
				'exportModal'     => array(
					'close'       => _x( 'Close', 'modal close button', 'admin-menu-manager' ),
					'title'       => __( 'Export', 'admin-menu-manager' ),
					'description' => __( 'Export your menu data to another site. Copy the text below:', 'admin-menu-manager' ),
					'formLabel'   => _x( 'Menu data', 'form label', 'admin-menu-manager' ),
					'buttonText'  => _x( 'Done', 'button text', 'admin-menu-manager' ),
				),
				'importModal'     => array(
					'close'       => _x( 'Close', 'modal close button', 'admin-menu-manager' ),
					'title'       => __( 'Import', 'admin-menu-manager' ),
					'description' => __( 'Import your menu data from another site. Insert the data here:', 'admin-menu-manager' ),
					'formLabel'   => _x( 'Menu data', 'form label', 'admin-menu-manager' ),
					'buttonText'  => _x( 'Import', 'button text', 'admin-menu-manager' ),
				),
				'collapseButton'  => array(
					'label' => __( 'Collapse menu', 'admin-menu-manager' ),
				),
				'menuItemOptions' => array(
					'title'      => __( 'Edit item', 'admin-menu-manager' ),
					'labelLabel' => __( 'Label:', 'admin-menu-manager' ),
					'iconLabel'  => __( 'Icon:', 'admin-menu-manager' ),
					'linkLabel'  => __( 'Link:', 'admin-menu-manager' ),
					'save'       => __( 'Save', 'admin-menu-manager' ),
				),
			),
			'parent_file'  => $parent_file,
			'submenu_file' => $submenu_file,
			'plugin_page'  => $plugin_page,
			'menu'         => $this->get_admin_menu(),
			'trash'        => $this->get_admin_menu_trash(),
		);
	}

	/**
	 * Grab a list of all registered admin pages.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_admin_menu() {
		global $menu;

		if ( null === $menu ) {
			$menu = array();
		}

		$menu_items = array();

		foreach ( $menu as $menu_item ) {
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
	 * Prepare a top-evel menu item.
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
	 * Get the children of a top-level menu item.
	 *
	 * @param array  $menu_item A single menu-item.
	 * @param string $menu_file The parent menu item's slug.
	 *
	 * @return array
	 */
	protected function get_admin_menu_sub_items( $menu_item, $menu_file ) {
		global $submenu;

		$children        = array();
		$admin_is_parent = false;

		if ( empty( $submenu[ $menu_item[2] ] ) ) {
			return $children;
		}

		$submenu_items = array_values( $submenu[ $menu_item[2] ] );  // Re-index.
		$menu_hook     = get_plugin_page_hook( $submenu_items[0][2], $menu_item[2] );

		if ( ! empty( $menu_hook ) || ( ( 'index.php' !== $submenu_items[0][2] ) && file_exists( WP_PLUGIN_DIR . "/$menu_file" ) && ! file_exists( ABSPATH . "/wp-admin/$menu_file" ) ) ) {
			$admin_is_parent = true;
		}

		foreach ( $submenu[ $menu_item[2] ] as $sub_item ) {
			$sub_file = $this->get_menu_item_file( $sub_item[2] );

			$menu_hook = get_plugin_page_hook( $sub_item[2], $menu_item[2] );

			if ( ! empty( $menu_hook ) || ( ( 'index.php' !== $sub_item[2] ) && file_exists( WP_PLUGIN_DIR . "/$sub_file" ) && ! file_exists( ABSPATH . "/wp-admin/$sub_file" ) ) ) {
				// If admin.php is the current page or if the parent exists as a file in the plugins or admin dir.
				if ( ( ! $admin_is_parent && file_exists( WP_PLUGIN_DIR . "/$menu_file" ) && ! is_dir( WP_PLUGIN_DIR . "/{$menu_item[2]}" ) ) || file_exists( $menu_file ) ) {
					$sub_item['inherit_parent'] = true;
				}
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
		$menu    = get_user_option( 'amm_trash_menu' );
		$submenu = get_user_option( 'amm_trash_submenu' );

		if ( ! is_array( $menu ) ) {
			$menu = array();
		}

		$menu_items = array();

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
	 * Retrieve the raw request entity (body)
	 *
	 * @see WP_REST_Server
	 *
	 * @return string
	 */
	protected function get_raw_data() {
		global $HTTP_RAW_POST_DATA;
		// A bug in PHP < 5.2.2 makes $HTTP_RAW_POST_DATA not set by default,
		// but we can do it ourself.
		if ( ! isset( $HTTP_RAW_POST_DATA ) ) {
			$HTTP_RAW_POST_DATA = file_get_contents( 'php://input' );
		}

		return $HTTP_RAW_POST_DATA;
	}

	/**
	 * Ajax Handler.
	 *
	 * Works for saving and resetting the menu.
	 */
	public function ajax_handler() {
		if ( ! apply_filters( 'amm_user_can_change_menu', current_user_can( 'read' ) ) ) {
			return;
		}

		if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			$this->update_menu();
		} else if ( 'DELETE' === $_SERVER['REQUEST_METHOD'] ) {
			$this->reset_menu();
		}

		die( 1 );
	}

	/**
	 * Update the menu.
	 *
	 * The passed array is splitted up in a menu and submenu array,
	 * just like WordPress uses it in the backend.
	 *
	 * Borrows
	 */
	public function update_menu() {
		$data = json_decode( $this->get_raw_data(), true );

		if ( ! is_array( $data ) || empty( $data ) ) {
			die( 1 );
		}

		$menu = $this->update_menu_loop( $data );
		$type = isset( $_REQUEST['type'] ) && 'trash' === $_REQUEST['type'] ? 'trash' : 'menu';

		do_action( 'amm_before_menu_update', $type, $menu );

		if ( 'trash' === $type ) {
			update_user_option( wp_get_current_user()->ID, 'amm_trash_menu', $menu['menu'], false );
			update_user_option( wp_get_current_user()->ID, 'amm_trash_submenu', $menu['submenu'], false );
		} else {
			update_user_option( wp_get_current_user()->ID, 'amm_menu', $menu['menu'], false );
			update_user_option( wp_get_current_user()->ID, 'amm_submenu', $menu['submenu'], false );
		}
	}

	/**
	 * Loop through all menu items to update the menu.
	 *
	 * @param array $menu The new admin menu data.
	 *
	 * @return array An array containing top level and sub level menu items.
	 */
	protected function update_menu_loop( $menu ) {
		$items   = array();
		$submenu = array();

		$separatorIndex = 1;
		$lastSeparator  = null;

		foreach ( $menu as $item ) {
			if ( false !== strpos( $item[2], '=' ) ) {
				$item[2] = str_replace( '=', '', strstr( $item[2], '=' ) );
			}

			$item = array(
				0          => wp_unslash( $item[0] ),
				1          => $item[1],
				2          => $item[2],
				3          => $item[3],
				4          => $item[4],
				5          => $item[5],
				6          => $item[6],
				'children' => isset( $item['children'] ) ? $item['children'] : array(),
				'href'     => $item['href'],
				'id'       => $item['id'],
			);

			if ( ! empty( $item['children'] ) ) {
				$submenu[ $item[2] ] = array();
				foreach ( $item['children'] as $subitem ) {
					if ( false !== strpos( $subitem[2], '=' ) ) {
						$subitem[2] = str_replace( '=', '', strstr( $subitem[2], '=' ) );
					}

					$subitem = array(
						0      => wp_unslash( $subitem[0] ),
						1      => $subitem[1],
						2      => $subitem[2],
						3      => $subitem[3],
						4      => $subitem[4],
						'href' => $subitem['href'],
						'id'   => $subitem['id'],
					);

					$submenu[ $item[2] ][] = $subitem;
				}
				unset( $item['children'] );
			}

			// Store separators in correct order.
			if ( false !== strpos( $item[2], 'separator' ) ) {
				$item          = array( '', 'read', 'separator' . $separatorIndex ++, '', 'wp-menu-separator' );
				$lastSeparator = count( $items );
			}

			$items[] = $item;
		}

		if ( null !== $lastSeparator ) {
			$items[ $lastSeparator ][2] = 'separator-last';
		}

		return array(
			'menu'    => $items,
			'submenu' => $submenu,
		);
	}

	/**
	 * Reset the menu completely.
	 */
	public function reset_menu() {
		$type = isset( $_REQUEST['type'] ) && 'trash' === $_REQUEST['type'] ? 'trash' : 'menu';

		do_action( 'amm_before_menu_reset', $type );

		if ( 'trash' === $type ) {
			delete_user_option( wp_get_current_user()->ID, 'amm_trash_menu' );
			delete_user_option( wp_get_current_user()->ID, 'amm_trash_submenu' );
		} else {
			delete_user_option( wp_get_current_user()->ID, 'amm_menu' );
			delete_user_option( wp_get_current_user()->ID, 'amm_submenu' );
		}
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
		$amm_menu          = apply_filters( 'amm_menu_data', get_user_option( 'amm_menu' ), 'menu' );
		$amm_submenu       = apply_filters( 'amm_menu_data', get_user_option( 'amm_submenu' ), 'submenu' );
		$amm_trash_menu    = apply_filters( 'amm_menu_data', get_user_option( 'amm_trash_menu' ), 'trash_menu' );
		$amm_trash_submenu = apply_filters( 'amm_menu_data', get_user_option( 'amm_trash_submenu' ), 'trash_submenu' );

		if ( ! $amm_menu ) {
			$amm_menu = get_option( 'amm_menu', array() );
		}

		if ( ! $amm_submenu ) {
			$amm_submenu = get_option( 'amm_submenu', array() );
		}

		if ( ! is_array( $amm_menu ) || empty( $amm_menu ) ) {
			return;
		}

		if ( ! is_array( $amm_submenu ) || empty( $amm_submenu ) ) {
			return;
		}

		if ( ! is_array( $amm_trash_menu ) ) {
			$amm_trash_menu = array();
		}

		if ( ! is_array( $amm_trash_submenu ) ) {
			$amm_trash_submenu = array();
		}

		global $menu, $submenu, $admin_page_hooks, $_registered_pages;

		$temp_menu             = array_values( $menu );
		$temp_submenu          = $submenu;
		$temp_admin_page_hooks = $admin_page_hooks;

		$menu = $submenu = $_registered_pages = null;

		// Iterate on the top level items.
		foreach ( $amm_menu as $priority => $item ) {
			$item_slug = $item[2];

			if ( isset( $item['href'] ) ) {
				preg_match( '/page=([a-z_0-9]*)/', $item['href'], $matches );
				if ( isset( $matches[1] ) ) {
					$item_slug = $matches[1];
				} else {
					$item_slug = $item['href'];
				}
			}

			// It was originally a top level item as well. It's a match!
			foreach ( $temp_menu as $key => $m_item ) {

				if ( $item_slug === $m_item[2] ) {
					if ( 'wp-menu-separator' === $m_item[4] ) {
						$menu[] = $m_item;
					} else {
						add_menu_page(
							$m_item[3], // Page title
							$m_item[0], // Menu title
							$m_item[1], // Capability
							$item_slug, // Slug
							'', // Function
							$m_item[6], // Icon
							$priority // Position
						);

						if ( isset( $amm_submenu[ $m_item[2] ] ) ) {
							$amm_submenu[ $item_slug ] = $amm_submenu[ $m_item[2] ];
						}
					}

					unset( $temp_menu[ $key ] );
					continue 2;
				}
			}

			// It must be a submenu item moved to the top level.
			foreach ( $temp_submenu as $key => $parent ) {
				foreach ( $parent as $sub_key => $sub_item ) {
					if ( $item_slug === $sub_item[2] ) {
						$hook_name = get_plugin_page_hookname( $sub_item[2], $key );

						if ( ! isset( $sub_item[3] ) ) {
							$sub_item[3] = $sub_item[0];
						}

						$new_page = add_menu_page(
							$sub_item[3], // Page title
							$sub_item[0], // Menu title
							$sub_item[1], // Capability
							$sub_item[2], // Slug
							'', // Function
							$item[6], // Icon
							$priority // Position
						);

						// Add hook name of the former parent as CSS class to the new item.
						$menu[ $priority ][4] .= ' ' . get_plugin_page_hookname( $key, $key );

						$this->switch_menu_item_filters( $hook_name, $new_page );

						unset( $temp_submenu[ $key ][ $sub_key ] );

						continue 3;
					}
				}
			}

			// It must be a custom menu item.
			if ( isset( $item['id'] ) && false !== strpos( $item['id'], 'custom-item' ) ) {
				$menu[] = array(
					0    => $item[0],
					1    => $item[1],
					2    => $item['href'],
					3    => $item[3],
					4    => $item[4],
					5    => $item[5],
					6    => $item[6],
					'id' => $item['id'],
				);
				continue;
			}

			// It must be a separator.
			if ( 'wp-menu-separator' === $item[4] ) {
				$menu[] = $item;
				continue;
			}
		}

		/**
		 * Loop through admin page hooks.
		 *
		 * We want to keep the original, untranslated values.
		 */
		foreach ( $admin_page_hooks as $key => &$value ) {
			if ( isset( $temp_admin_page_hooks[ $key ] ) ) {
				$value = $temp_admin_page_hooks[ $key ];
			}
		}

		// Iterate on all our submenu items.
		foreach ( $amm_submenu as $parent_page => $page ) {
			foreach ( $page as $priority => $item ) {
				// Iterate on original top level menu items.
				foreach ( $temp_menu as $m_key => $m_item ) {
					if ( $item[2] === $m_item[2] ) {
						$hook_name = get_plugin_page_hookname( $m_item[2], $parent_page );

						$new_page = add_submenu_page(
							$parent_page, // Parent Slug
							$m_item[0], // Page title
							$m_item[0], // Menu title
							$m_item[1], // Capability
							$m_item[2] // Slug
						);

						// Don't loose grand children.
						if ( isset( $temp_submenu[ $m_item[2] ] ) ) {
							foreach ( $temp_submenu[ $m_item[2] ] as $s_item ) {
								$hook_name = get_plugin_page_hookname( $s_item[2], $m_item[2] );

								$new_page = add_submenu_page(
									$parent_page, // Parent Slug
									$s_item[3], // Page title
									$s_item[0], // Menu title
									$s_item[1], // Capability
									$s_item[2] // Slug
								);

								$this->switch_menu_item_filters( $hook_name, $new_page );

								// Add original parent slug to sub menu item.
								end( $submenu[ $parent_page ] );
								$submenu[ $parent_page ][ key( $submenu[ $parent_page ] ) ]['original_parent'] = $m_item[2];

								unset( $s_item );
							}
						}

						$this->switch_menu_item_filters( $hook_name, $new_page );

						unset( $temp_menu[ $m_key ] );

						continue 2;
					}
				}

				// Iterate on original submenu items.
				foreach ( $temp_submenu as $s_parent_page => &$s_page ) {
					foreach ( $s_page as $s_priority => &$s_item ) {
						if ( $item[2] === $s_item[2] ) {
							$hook_name = get_plugin_page_hookname( $s_item[2], $s_parent_page );

							$new_page = add_submenu_page(
								$parent_page, // Parent Slug
								isset( $s_item[3] ) ? $s_item[3] : $s_item[0], // Page title
								$s_item[0], // Menu title
								$s_item[1], // Capability
								$s_item[2] // Slug
							);

							$this->switch_menu_item_filters( $hook_name, $new_page );

							unset( $temp_submenu[ $s_parent_page ][ $s_priority ] );

							continue 2;
						}
					}
				}

				// It must be a custom menu item.
				if ( isset( $item['id'] ) && false !== strpos( $item['id'], 'custom-item' ) ) {
					$submenu[ $parent_page ][] = array(
						0    => $item[0],
						1    => $item[1],
						2    => $item['href'],
						'id' => $item['id'],
					);
					continue;
				}

				// It must be a separator.
				if ( isset( $item[4] ) && 'wp-menu-separator' === $item[4] ) {
					$submenu[ $parent_page ][] = $item;
					continue;
				}
			}
		}

		// Remove trashed items.
		foreach ( $amm_trash_menu as $priority => $item ) {
			// It was originally a top level item as well. It's a match!
			foreach ( $temp_menu as $key => $m_item ) {
				if ( $item[2] === $m_item[2] ) {
					unset( $temp_menu[ $key ] );
					continue 2;
				}
			}

			// It must be a submenu item moved to the top level.
			foreach ( $temp_submenu as $key => $parent ) {
				foreach ( $parent as $sub_key => $sub_item ) {
					if ( $item[2] === $sub_item[2] ) {
						unset( $temp_submenu[ $key ][ $sub_key ] );
						continue 3;
					}
				}
			}
		}

		foreach ( $amm_trash_submenu as $parent_page => $page ) {
			foreach ( $page as $priority => $item ) {
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
		 * Append elements that haven't been added to a menu yet.
		 *
		 * This happens when installing a new plugin for example.
		 */
		$menu = array_merge( $menu, $temp_menu );

		foreach ( $temp_submenu as $parent => $item ) {
			if ( '' === $parent || empty( $item ) || ! is_array( $item ) ) {
				continue;
			}

			if ( isset( $submenu[ $parent ] ) ) {
				$submenu[ $parent ] = array_merge( $submenu[ $parent ], $item );
			} else {
				$submenu[ $parent ] = $item;
			}
		}
	}

	/**
	 * Get all the filters hooked to an admin menu page.
	 *
	 * @param string $hook_name The plugin page hook name.
	 *
	 * @return array
	 */
	protected function get_menu_item_filters( $hook_name ) {
		global $wp_filter;

		$old_filters = array();

		foreach ( $wp_filter as $filter => $value ) {
			if ( false !== strpos( $filter, $hook_name ) ) {
				$old_filters[ $filter ] = $value;
				unset( $wp_filter[ $filter ] );
			}
		}

		return $old_filters;
	}

	/**
	 * Add the hooks attached to the original menu item to the new one.
	 *
	 * @param string $old_hook Old hook name.
	 * @param string $new_hook New hook name.
	 */
	protected function switch_menu_item_filters( $old_hook, $new_hook ) {
		global $wp_filter;

		foreach ( $this->get_menu_item_filters( $old_hook ) as $filter => $value ) {
			$wp_filter[ str_replace( $old_hook, $new_hook, $filter ) ] = $value;
		}
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

		$amm_menu = get_user_option( 'amm_menu' );

		if ( ! $amm_menu ) {
			$amm_menu = get_option( 'amm_menu', false );
		}

		if ( ! $amm_menu ) {
			return $menu_order;
		}

		$new_order = array();
		foreach ( $menu as $item ) {
			$new_order[] = $item[2];
		}

		return $new_order;
	}
}
