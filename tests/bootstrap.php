<?php

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {
	require dirname( __FILE__ ) . '/../admin-menu-manager.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';

class Admin_Menu_Manager_TestCase extends WP_UnitTestCase {
	function set_post( $key, $value ) {
		$_POST[ $key ] = $_REQUEST[ $key ] = addslashes( $value );
	}

	function unset_post( $key ) {
		unset( $_POST[ $key ], $_REQUEST[ $key ] );
	}
}
