<?php
/**
 * Plugin Name: Admin Menu Manager
 * Plugin URI:  http://required.ch
 * Description: Manage the WordPress admin menu using a simple drag & drop interface.
 * Version:     1.0.3
 * Author:      required+
 * Author URI:  http://required.ch
 * License:     GPLv2+
 * Text Domain: admin-menu-manager
 * Domain Path: /languages
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

defined( 'WPINC' ) or die;

include( dirname( __FILE__ ) . '/lib/requirements-check.php' );

$admin_menu_manager_requirements_check = new Admin_Menu_Manager_Requirements_Check( array(
	'title' => 'Admin Menu Manager',
	'php'   => '5.3',
	'wp'    => '4.0',
	'file'  => __FILE__,
));

if ( $admin_menu_manager_requirements_check->passes() ) {
	// Pull in the plugin classes and initialize
	include( dirname( __FILE__ ) . '/lib/wp-stack-plugin.php' );
	include( dirname( __FILE__ ) . '/classes/plugin.php' );
	Admin_Menu_Manager_Plugin::start( __FILE__ );
}

unset( $admin_menu_manager_requirements_check );
