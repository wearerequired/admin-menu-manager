<?php
/**
 * Admin Menu Manager
 *
 * @package   Admin_Menu_Manager
 * @author    Pascal Birchler <pascal@required.ch>
 * @license   GPL-2.0+
 * @link      https://github.com/wearerequired/admin-menu-manager/
 * @copyright 2015 required gmbh
 *
 * @wordpress-plugin
 * Plugin Name: Admin Menu Manager
 * Plugin URI:  https://github.com/wearerequired/admin-menu-manager
 * Description: Manage the WordPress admin menu using a simple drag & drop interface.
 * Version:     1.0.0
 * Author:      required+
 * Author URI:  http://required.ch
 * Text Domain: admin-menu-manager
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path: /languages
 */

// Don't call this file directly
defined( 'ABSPATH' ) or die;

/**
 * Class User_Feedback
 */
final class Admin_Menu_Manager {

	const VERSION = '1.0.0';

	/**
	 * Add all hooks on init
	 */
	public static function init() {
		// Load plugin text domain
		add_action( 'init', array( __CLASS__, 'load_plugin_textdomain' ) );

		// Handle form submissions
		add_action( 'wp_ajax_amm_update_menu', array( __CLASS__, 'update_menu' ) );

		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_enqueue_scripts' ) );

		// Modify admin menu
		add_action( 'admin_menu', array( __CLASS__, 'alter_admin_menu' ), 999 );

		// Tell WordPress we're changing the menu order
		add_filter( 'custom_menu_order', '__return_true' );

		// Add our filter way late, after other plugins have defiled the menu
		add_filter( 'menu_order', array( __CLASS__, 'alter_admin_menu_order' ), 9999 );

		// Add edit button to menu
		add_action( 'adminmenu', array( __CLASS__, 'add_adminmenu_button' ) );
	}

	/**
	 * This loads the plugin's gettext translations from the /languages folder.
	 *
	 * Each mo/po file needs to be prefixed with the plugin's slug, e.g. admin-menu-manager-de_DE.mo.
	 */
	public static function load_plugin_textdomain() {
		load_plugin_textdomain( 'admin-menu-manager', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}

	/**
	 * Load our JavaScript and CSS if the user has enough capabilities to edit the menu.
	 */
	public static function admin_enqueue_scripts() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_enqueue_style( 'admin-menu-manager', plugins_url( 'css/admin-menu-manager.css', __FILE__ ), array(), self::VERSION );

		global $_wp_admin_css_colors;

		$current_color = get_user_option( 'admin_color' );
		if ( isset( $_wp_admin_css_colors[ $current_color ] ) ) {
			$border     = $_wp_admin_css_colors[ $current_color ]->icon_colors['base'];
			$background = $_wp_admin_css_colors[ $current_color ]->colors[0];
			$base       = $_wp_admin_css_colors[ $current_color ]->icon_colors['base'];
			$focus      = $_wp_admin_css_colors[ $current_color ]->icon_colors['focus'];
			$current    = $_wp_admin_css_colors[ $current_color ]->icon_colors['current'];
			$inline_css = "
			#adminmenu:not(.ui-sortable-disabled) .wp-menu-separator.ui-sortable-handle { background-color: $background; border-color: $border !important; }
			#admin-menu-manager-edit .menu-top { color: $base; }
			#admin-menu-manager-edit .menu-top:focus,
			#admin-menu-manager-edit .menu-top:focus div.wp-menu-image:before { color: $focus !important; }
			#admin-menu-manager-edit:hover .menu-top,
			#admin-menu-manager-edit:hover div.wp-menu-image:before { color: $current !important; }
			";
			wp_add_inline_style( 'admin-menu-manager', $inline_css );
		}

		// Use minified libraries if SCRIPT_DEBUG is turned off
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		wp_enqueue_script(
			'admin-menu-manager',
			plugins_url( 'js/build/admin-menu-manager' . $suffix . '.js', __FILE__ ),
			array(
				'jquery-ui-sortable',
				'underscore'
			),
			self::VERSION, true );

		wp_localize_script( 'admin-menu-manager', 'AdminMenuManager', array(
			'buttonEdit'   => __( 'Edit Menu', 'admin-menu-manager' ),
			'buttonSave'   => __( 'Save', 'admin-menu-manager' ),
			'buttonSaving' => __( 'Saving&hellip;', 'admin-menu-manager' ),
			'buttonSaved'  => __( 'Saved!', 'admin-menu-manager' ),
			'adminMenu'    => self::get_admin_menu(),
		) );
	}

	/**
	 * Ajax Handler to update the menu.
	 *
	 * The passed array is splitted up in a menu and submenu array,
	 * just like WordPress uses it in the backend.
	 */
	public static function update_menu() {
		$menu    = $_REQUEST['adminMenu'];
		$items   = array();
		$submenu = array();

		$separatorIndex = 1;
		$lastSeparator  = null;

		foreach ( $menu as $index => $item ) {
			$item[0] = wp_unslash( $item[0] );

			if ( isset( $item[7] ) ) {
				$submenu[ $item[2] ] = array();
				foreach ( $item[7] as $subitem ) {
					$subitem[0]            = wp_unslash( $subitem[0] );
					$subitem               = array_slice( $subitem, 0, 4 );
					$submenu[ $item[2] ][] = $subitem;
				}
				unset( $item[7] );
			}

			// Store separators in correct order
			if ( false !== strpos( $item[2], 'separator' ) ) {
				$item[2]       = 'separator' . $separatorIndex ++;
				$item[4]       = 'wp-menu-separator';
				$lastSeparator = count( $items );
			}

			$items[] = $item;
		}

		$items[ $lastSeparator ][2] = 'separator-last';

		// Note: The third autoload parameter was introduced in WordPress 4.2.0
		update_option( 'amm_menu', $items, false );
		update_option( 'amm_submenu', $submenu, false );

		die( 1 );
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
	public static function alter_admin_menu() {
		$amm_menu    = get_option( 'amm_menu', array() );
		$amm_submenu = get_option( 'amm_submenu', array() );

		if ( empty( $amm_menu ) || empty( $amm_submenu ) ) {
			return;
		}

		global $menu, $submenu, $wp_filter;;

		$temp_menu    = $menu;
		$temp_submenu = $submenu;

		$menu    = null;
		$submenu = null;

		// Iterate on the top level items
		foreach ( $amm_menu as $priority => &$item ) {
			// It was originally a top level item as well. It's a match!
			foreach ( $temp_menu as $key => $m_item ) {
				if ( $item[2] === $m_item[2] ) {
					if ( 'wp-menu-separator' == $m_item[4] ) {
						$menu[ $priority ] = $m_item;
					} else {
						add_menu_page(
							$m_item[3], // Page title
							$m_item[0], // Menu title
							$m_item[1], // Capability
							$m_item[2], // Slug
							'', // Function
							$m_item[6], // Icon
							$priority // Position
						);
					}

					unset( $temp_menu[ $key ] );
					continue 2;
				}
			}

			// It must be a submenu item moved to the top level
			foreach ( $temp_submenu as $key => &$parent ) {
				foreach ( $parent as $sub_key => &$sub_item ) {
					if ( $item[2] === $sub_item[2] ) {
						$hookname = get_plugin_page_hookname( $sub_item[2], $key );

						if ( has_action( $hookname ) ) {
							$menu_hooks = array();
							foreach ( $wp_filter[ $hookname ][10] as $hook ) {
								$menu_hooks[] = $hook['function'];
							}
						}

						if ( has_action( 'admin_print_styles-' . $hookname ) ) {
							$styles_hooks = array();
							foreach ( $wp_filter[ 'admin_print_styles-' . $hookname ][10] as $hook ) {
								$styles_hooks[] = $hook['function'];
							}
						}

						if ( has_action( 'admin_print_scripts-' . $hookname ) ) {
							$scripts_hooks = array();
							foreach ( $wp_filter[ 'admin_print_scripts-' . $hookname ][10] as $hook ) {
								$scripts_hooks[] = $hook['function'];
							}
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

						if ( isset( $menu_hooks ) ) {
							foreach ( $menu_hooks as $hook ) {
								add_action( $new_page, $hook );
							}
						}

						if ( isset( $styles_hooks ) ) {
							foreach ( $styles_hooks as $hook ) {
								add_action( 'admin_print_styles-' . $new_page, $hook );
							}
						}

						if ( isset( $scripts_hooks ) ) {
							foreach ( $scripts_hooks as $hook ) {
								add_action( 'admin_print_scripts-' . $new_page, $hook );
							}
						}

						unset( $temp_submenu[ $key ][ $sub_key ] );

						continue 3;
					}
				}
			}

			// Still no match, menu item must have been removed.
			unset( $temp_menu[ $priority ] );
		}

		// Iterate on all our submenu items
		foreach ( $amm_submenu as $parent_page => &$page ) {
			foreach ( $page as $priority => &$item ) {
				// Iterate on original submenu items
				foreach ( $temp_submenu as $s_parent_page => &$s_page ) {
					foreach ( $s_page as $s_priority => &$s_item ) {
						if ( $item[2] === $s_item[2] && $parent_page == $s_parent_page ) {
							add_submenu_page(
								$s_parent_page, // Parent Slug
								isset( $s_item[3] ) ? $s_item[3] : $s_item[0], // Page title
								$s_item[0], // Menu title
								$s_item[1], // Capability
								$s_item[2] // SLug
							);

							unset( $temp_submenu[ $s_parent_page ][ $s_priority ] );

							continue 2;
						}
					}
				}

				// It must be a top level item moved to submenu
				foreach ( $temp_menu as $m_key => &$m_item ) {
					if ( $item[2] === $m_item[2] ) {
						$hookname = get_plugin_page_hookname( $m_item[2], '' );

						if ( has_action( $hookname ) ) {
							$menu_hooks = array();
							foreach ( $wp_filter[ $hookname ][10] as $hook ) {
								$menu_hooks[] = $hook['function'];
							}
						}

						if ( has_action( 'admin_print_styles-' . $hookname ) ) {
							$styles_hooks = array();
							foreach ( $wp_filter[ 'admin_print_styles-' . $hookname ][10] as $hook ) {
								$styles_hooks[] = $hook['function'];
							}
						}

						if ( has_action( 'admin_print_scripts-' . $hookname ) ) {
							$scripts_hooks = array();
							foreach ( $wp_filter[ 'admin_print_scripts-' . $hookname ][10] as $hook ) {
								$scripts_hooks[] = $hook['function'];
							}
						}

						$new_page = add_submenu_page(
							$parent_page, // Parent Slug
							$m_item[0], // Page title
							$m_item[0], // Menu title
							$m_item[1], // Capability
							$m_item[2] // Slug
						);

						if ( isset( $menu_hook ) ) {
							add_action( $new_page, $menu_hook );
						}

						if ( isset( $menu_hooks ) ) {
							foreach ( $menu_hooks as $hook ) {
								add_action( $new_page, $hook );
							}
						}

						if ( isset( $styles_hooks ) ) {
							foreach ( $styles_hooks as $hook ) {
								add_action( 'admin_print_styles-' . $new_page, $hook );
							}
						}

						if ( isset( $scripts_hooks ) ) {
							foreach ( $scripts_hooks as $hook ) {
								add_action( 'admin_print_scripts-' . $new_page, $hook );
							}
						}

						unset( $temp_menu[ $m_key ] );

						continue 2;
					}
				}

				// Still no match, menu item must have been removed.
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
	 * Make sure our menu order is kept.
	 *
	 * Some plugins (I'm looking at you, Jetpack!) want to alwas be on top,
	 * let's fix this.
	 *
	 * @param array $menu_order WordPress admin menu order.
	 *
	 * @return array
	 */
	public static function alter_admin_menu_order( $menu_order ) {
		global $menu;

		if ( ! get_option( 'amm_menu', false ) ) {
			return $menu_order;
		}

		$new_order = array();
		foreach ( $menu as $item ) {
			$new_order[] = $item[2];
		}

		return $new_order;
	}

	/**
	 * Add our edit button to the menu.
	 */
	public static function add_adminmenu_button() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<li id="admin-menu-manager-edit" class="hide-if-no-js">
			<a href="#" class="menu-top" title="<?php esc_attr_e( 'Edit Menu', 'admin-menu-manager' ); ?>">
				<div class="wp-menu-image dashicons-before dashicons-edit"></div>
				<div class="wp-menu-name"><?php _e( 'Edit Menu', 'admin-menu-manager' ); ?></div>
			</a>
		</li>
		<?php
	}

	/**
	 * Grab a list of all registered admin pages.
	 *
	 * @since 1.0.0
	 */
	public static function get_admin_menu() {
		global $menu, $submenu;

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
				$menu_item[] = array_values( $submenu[ $menu_item[2] ] );
			} else {
				$menu_item[] = array();
			}

			$menu_items[] = $menu_item;
		}

		return $menu_items;
	}

}

if ( is_admin() ) {
	add_action( 'plugins_loaded', array( 'Admin_Menu_Manager', 'init' ) );
}