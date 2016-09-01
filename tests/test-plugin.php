<?php

class Admin_Menu_Manager_Test extends WP_UnitTestCase {
	/**
	 * @var int Current user ID.
	 */
	protected $current_user;

	public function setUp() {
		parent::setUp();
		$this->current_user = get_current_user_id();
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function tearDown() {
		wp_set_current_user( $this->current_user );
		parent::tearDown();
	}

	public function test_get_admin_menu_empty() {
		$menu_items = admin_menu_manager()->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertEmpty( $menu_items );
	}

	public function test_add_admin_menu() {
		global $hook_suffix;
		$hook_suffix = '';

		require_once ABSPATH . '/wp-admin/menu.php';

		$menu_items = admin_menu_manager()->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertNotEmpty( $menu_items );
	}

	public function test_admin_enqueue_scripts() {
		admin_menu_manager()->admin_enqueue_scripts();

		$this->assertTrue( wp_style_is( 'admin-menu-manager', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'backbone-undo', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'admin-menu-manager', 'enqueued' ) );
	}
}
