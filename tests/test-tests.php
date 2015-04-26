<?php

/**
 * Class Admin_Menu_Manager_Test_Utils
 *
 * Utility class for the Admin Menu Manager Testing Suite.
 */
class Admin_Menu_Manager_Test_Utils extends Admin_Menu_Manager_TestCase {

	function test_tests() {
		$this->assertTrue( true );
	}
	function test_sample_string() {
		$string = "Unit tests are sweet!";

		$this->assertEquals( "Unit tests are sweet!", $string );
		$this->assertNotEquals( "Unit tests suck!", $string );
	}
	function test_get_admin_menu() {

		$menu_items = $this->plugin()->get_admin_menu();
		$this->assertInternalType( 'array' , $menu_items );

	}
}
