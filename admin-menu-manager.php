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
			$border     = $_wp_admin_css_colors[ $current_color ]->colors[2];
			$background = $_wp_admin_css_colors[ $current_color ]->colors[1];
			$base       = $_wp_admin_css_colors[ $current_color ]->icon_colors['base'];
			$focus      = $_wp_admin_css_colors[ $current_color ]->icon_colors['focus'];
			$current    = $_wp_admin_css_colors[ $current_color ]->icon_colors['current'];
			$inline_css = "
			#adminmenu:not(.ui-sortable-disabled) .wp-menu-separator.ui-sortable-handle { background-color: $background; border-color: $border !important; }
			#admin-menu-manager-edit .menu-top { color: $base; }
			#admin-menu-manager-edit a:focus,
			#admin-menu-manager-edit a:focus div.wp-menu-image:before { color: $focus !important; }
			#admin-menu-manager-edit:hover,
			#admin-menu-manager-edit:hover div.wp-menu-image:before { color: $current !important; }
			";
			wp_add_inline_style( 'admin-menu-manager', $inline_css );
		}

		wp_enqueue_script( 'admin-menu-manager', plugins_url( 'js/build/admin-menu-manager.min.js', __FILE__ ), array(
			'jquery-ui-sortable',
			'underscore'
		), self::VERSION, true );

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

		foreach ( $menu as $item ) {
			$item[0] = wp_unslash( $item[0] );
			if ( isset( $item[7] ) ) {
				$submenu[ $item[2] ] = array();
				foreach ( $item[7] as $subitem ) {
					$subitem[0] = wp_unslash( $subitem[0] );
					$pos        = $subitem[3];
					unset( $subitem[3] );
					$submenu[ $item[2] ][ $pos ] = $subitem;
				}
				unset( $item[7] );
			}

			$items[] = $item;
		}

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
	 */
	public static function alter_admin_menu() {
		$amm_menu    = get_option( 'amm_menu', array() );
		$amm_submenu = get_option( 'amm_submenu', array() );

		if ( empty( $amm_menu ) || empty( $amm_submenu ) ) {
			return;
		}

		global $menu, $submenu;

		// Iterate on the top level items
		foreach ( $amm_menu as $priority => &$item ) {
			$match = false;

			// It was originally a top level item as well. It's a match!
			foreach ( $menu as $key => $m_item ) {
				if ( $item[2] === $m_item[2] ) {
					$item = $m_item;
					unset( $menu[ $key ] ); // Remove from the array
					$match = true;
					break;
				}
			}

			// It must be a submenu item moved to the top level
			if ( ! $match ) {
				foreach ( $submenu as $key => &$parent ) {
					foreach ( $parent as $sub_key => &$sub_item ) {
						if ( $item[2] === $sub_item[2] ) {
							$n4 = esc_attr( $item[4] ); // class attribute, e.g. 'menu-top'
							$n6 = esc_attr( $item[6] ); // Dashicon, e.g. 'dashicons-admin-generic'

							$item = $sub_item;

							unset( $submenu[ $key ][ $sub_key ] ); // Remove from the array

							// Some fields aren't set in the original
							$item[3] = '';
							$item[4] = $n4;
							$item[5] = '';
							$item[6] = $n6;

							$match = true;
							break 2;
						}
					}
				}

				// Still no match, menu item must have been removed.
				unset( $amm_menu[ $priority ] );
			}
		}

		// Store submenu items in a new array because the $priority isn't always numeric
		$clean_submenu = array();

		// Iterate on all submenu items
		foreach ( $amm_submenu as $parent_page => &$page ) {
			foreach ( $page as $priority => &$item ) {
				$match = false;

				foreach ( $submenu as $s_parent_page => &$s_page ) {
					foreach ( $s_page as $s_priority => &$s_item ) {
						if ( $item[2] === $s_item[2] ) {
							$clean_submenu[ $parent_page ][] = $s_item;
							unset( $submenu[ $s_parent_page ][ $s_priority ] ); // Remove from the array
							$match = true;
							break 2;
						}
					}
				}

				// It must be a top level item moved to submenu
				if ( ! $match ) {
					foreach ( $menu as &$m_item ) {
						if ( $item[2] === $m_item[2] ) {
							$item  = $m_item;
							$match = true;
							break;
						}
					}

					// Still no match, menu item must have been removed.
					unset( $amm_submenu[ $parent_page ][ $priority ] );
				}
			}
		}

		/**
		 * Append elements that haven't been added to a menu yet.
		 *
		 * This happens when installing a new plugin for example.
		 */
		$amm_menu = array_merge( $amm_menu, $menu );

		foreach ( $submenu as $parent => $item ) {
			if ( '' === $parent || empty( $item ) || ! is_array( $item ) ) {
				continue;
			}

			if ( isset( $clean_submenu[ $parent ] ) ) {
				$clean_submenu[ $parent ] = array_merge( $clean_submenu[ $parent ], $item );
			} else {
				$clean_submenu[ $parent ] = $item;
			}
		}

		$menu    = $amm_menu;
		$submenu = $clean_submenu;
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
			<a href="#" class="menu-top">
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
			}

			$menu_items[] = $menu_item;
		}

		return $menu_items;
	}

}

if ( is_admin() ) {
	add_action( 'plugins_loaded', array( 'Admin_Menu_Manager', 'init' ) );
}