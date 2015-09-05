<?php
/**
 * Delete all options when the plugin is uninstalled.
 *
 * @package   Admin_Menu_Manager
 * @author    Pascal Birchler <pascal@required.ch>
 * @license   GPL-2.0+
 * @link      https://github.com/wearerequired/admin-menu-manager
 * @copyright 2015 required gmbh
 */

// If uninstall, not called from WordPress, then exit.
defined( 'WP_UNINSTALL_PLUGIN' ) or die;

// Delete old-style options from version 1.x.
delete_option( 'amm_menu' );
delete_option( 'amm_submenu' );

// Delete options from version 2.x.
delete_metadata( 'user', null, 'amm_menu', '', true );
delete_metadata( 'user', null, 'amm_submenu', '', true );
delete_metadata( 'user', null, 'amm_trash_menu', '', true );
delete_metadata( 'user', null, 'amm_trash_submenu', '', true );
