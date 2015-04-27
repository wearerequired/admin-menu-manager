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

// If uninstall, not called from WordPress, then exit
defined( 'WP_UNINSTALL_PLUGIN' ) or die;

delete_option( 'amm_menu' );
delete_option( 'amm_submenu' );