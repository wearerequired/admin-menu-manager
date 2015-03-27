<?php
/**
 * Admin Menu Manager
 *
 * @package   Admin_Menu_Manager
 * @author    Pascal Birchler <pascal@required.ch>
 * @license   GPL-2.0+
 * @link      https://github.com/wearerequired/user-feedback/
 * @copyright 2015 required gmbh
 *
 * @wordpress-plugin
 * Plugin Name: Admin Menu Manager
 * Plugin URI:  https://github.com/wearerequired/simple-user-adding
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
		add_action( 'wp_ajax_amm_update_menu_settings', array( __CLASS__, 'update_menu_settings' ) );

		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_enqueue_scripts' ) );

		// Filter menu order
		add_filter( 'custom_menu_order', '__return_true' );
		add_filter( 'menu_order', array( __CLASS__, 'custom_menu_order' ) );

		add_action( 'adminmenu', array( __CLASS__, 'add_adminmenu_button' ) );
	}

	public static function load_plugin_textdomain() {
		load_plugin_textdomain( 'simple-user-adding', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}

	public static function admin_enqueue_scripts() {
		wp_enqueue_style( 'admin-menu-manager', plugins_url( 'css/admin-menu-manager.css', __FILE__ ), array(), self::VERSION );
		wp_enqueue_script( 'admin-menu-manager', plugins_url( 'js/admin-menu-manager.js', __FILE__ ), array( 'jquery-ui-sortable' ), self::VERSION, true );

		wp_localize_script( 'admin-menu-manager', 'AdminMenuManager', array(
			'buttonEdit'   => __( 'Edit Menu', 'admin-menu-manager' ),
			'buttonSave'   => __( 'Save', 'admin-menu-manager' ),
			'buttonSaving' => __( 'Saving&hellip;', 'admin-menu-manager' ),
			'buttonSaved'  => __( 'Saved!', 'admin-menu-manager' ),
		) );
	}

	public static function update_menu_settings() {
		$items           = $_REQUEST['menu_item_positions'];
		$new_items       = array();
		$separator_count = 1;

		foreach ( $items as $item ) {
			if ( isset( $item['separator'] ) ) {
				$new_items[] = 'separator' . $separator_count;
				$separator_count++;
			} else if ( isset( $item['href'] ) ) {
				$new_items[] = esc_sql( str_replace( 'admin.php?page=', '', $item['href'] ) );
			}
		}

		die( (int) update_option( 'amm_menu_order', $new_items, false ) );
	}

	public static function custom_menu_order( $menu_order ) {
		$new_menu_order = get_option( 'amm_menu_order', array() );

		global $menu, $default_menu_order;
		/*
		var_dump( $default_menu_order );
		var_dump( $new_menu_order );/**/

		if ( empty( $new_menu_order ) ) {
			return $menu_order;
		}

		foreach( array_reverse( $new_menu_order ) as $key ) {
			if ( false !== strpos( $key, 'separator' ) ) {
				$new_menu_order[array_search($key, $new_menu_order)] = 'separator-last';
				break;
			}
		}

		return $new_menu_order;
	}

	public static function add_adminmenu_button() { ?>
		<li id="admin-menu-manager-edit" class="hide-if-no-js">
			<a href="#" class="menu-top">
				<div class="wp-menu-image dashicons-before dashicons-admin-tools"></div>
				<div class="wp-menu-name"><?php _e( 'Edit Menu', 'admin-menu-manager' ); ?></div>
			</a>
		</li>
		<?php
	}

}

add_action( 'plugins_loaded', array( 'Admin_Menu_Manager', 'init' ) );