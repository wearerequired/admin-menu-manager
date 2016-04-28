<?php

class Admin_Menu_Manager_Test extends Admin_Menu_Manager_TestCase {
	protected $plugin;

	function setUp() {
		parent::setUp();
		$this->current_user = get_current_user_id();
		wp_set_current_user( $this->factory->user->create( array( 'role' => 'administrator' ) ) );
		$this->plugin = new Admin_Menu_Manager();
	}

	function tearDown() {
		wp_set_current_user( $this->current_user );
		parent::tearDown();
	}

	function test_tests() {
		$this->assertTrue( true );
	}

	function test_get_admin_menu_empty() {
		$menu_items = $this->plugin->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertEmpty( $menu_items );
	}

	function test_add_admin_menu() {
		global $hook_suffix, $menu, $_wp_submenu_nopriv;
		$hook_suffix = '';

		require_once ABSPATH . '/wp-admin/menu.php';

		$menu_items = $this->plugin->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertNotEmpty( $menu_items );
	}
}
