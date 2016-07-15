<?php
/**
 * Separate init file that isn't compatible with PHP 5.3 or lower.
 *
 * @package Admin_Menu_Manager
 */

/**
 * Returns the Admin Menu Manager controller instance.
 *
 * @since 2.0.0
 *
 * @return \Required\Admin_Menu_Manager\Controller
 */
function admin_menu_manager() {
	static $controller = null;

	if ( null === $controller ) {
		$controller = new \Required\Admin_Menu_Manager\Controller( __FILE__ );
	}

	return $controller;
}

// Initialize the plugin.
add_action( 'plugins_loaded', [ admin_menu_manager(), 'add_hooks' ] );