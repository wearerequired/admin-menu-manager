<?php
/**
 * Delete all options when the plugin is uninstalled.
 *
 * @package   Admin_Menu_Manager
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
