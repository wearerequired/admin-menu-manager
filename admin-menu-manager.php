<?php
/**
 * Plugin Name: Admin Menu Manager
 * Plugin URI:  https://github.com/wearerequired/admin-menu-manager/
 * Description: Manage the WordPress admin menu using a simple drag & drop interface.
 * Version:     2.0.0-alpha
 * Author:      required+
 * Author URI:  http://required.ch
 * License:     GPLv2+
 * Text Domain: admin-menu-manager
 * Domain Path: /languages
 *
 * @package Admin_Menu_Manager
 */

/**
 * Copyright (c) 2015 required+ (email : support@required.ch)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2 or, at
 * your discretion, any later version, as published by the Free
 * Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

if ( file_exists( dirname( __FILE__ ) . '/vendor/autoload.php' ) ) {
	require dirname( __FILE__ ) . '/vendor/autoload.php';
}

$requirements_check = new WP_Requirements_Check( array(
	'title' => 'Admin Menu Manager',
	'php'   => '5.4',
	'wp'    => '4.4',
	'file'  => __FILE__,
) );

if ( $requirements_check->passes() ) {
	include( dirname( __FILE__ ) . '/classes/class-admin-menu-manager.php' );

	/**
	 * Get the Admin Menu Manager controller instance.
	 *
	 * @since 2.0.0
	 *
	 * @return Admin_Menu_Manager
	 */
	function admin_menu_manager() {
		static $controller = null;

		if ( null === $controller ) {
			$controller = new Admin_Menu_Manager( __FILE__ );
		}

		return $controller;
	}

	// Initialize the plugin.
	add_action( 'plugins_loaded', array( admin_menu_manager(), 'add_hooks' ) );
}

unset( $requirements_check );
