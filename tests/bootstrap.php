<?php

$_tests_dir = getenv('WP_TESTS_DIR');
if ( !$_tests_dir ) $_tests_dir = '/tmp/wordpress-tests-lib';

require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {
	require dirname( __FILE__ ) . '/../admin-menu-manager.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';

activate_plugin( 'admin-menu-manager/admin-menu-manager.php' );
echo "Installing Admin Menu Manager...\n";

global $current_user;
$current_user = new WP_User(1);
$current_user->set_role('administrator');

class Admin_Menu_Manager_TestCase extends WP_UnitTestCase {
	function plugin() {
		return Admin_Menu_Manager_Plugin::get_instance();
	}

	function set_post( $key, $value ) {
		$_POST[$key] = $_REQUEST[$key] = addslashes( $value );
	}

	function unset_post( $key ) {
		unset( $_POST[$key], $_REQUEST[$key] );
	}

	/**
	 * Utility to echo out actions.
	 *
	 * Taken from wordpress-develop/phpunit/includes/utils.php
	 *
	 * @param           $callable
	 * @param   array   $args
	 *
	 * @return  string
	 */
	function get_echo( $callable, $args = array() ) {
		ob_start();
		call_user_func_array($callable, $args);
		return ob_get_clean();
	}
}
