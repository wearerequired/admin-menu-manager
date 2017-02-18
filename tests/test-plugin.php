<?php

class Admin_Menu_Manager_Test extends WP_UnitTestCase {
	/**
	 * @var int Current user ID.
	 */
	protected $current_user;

	public static function setUpBeforeClass() {
		parent::setUpBeforeClass();

		require_once ABSPATH . '/wp-admin/menu.php';

		register_admin_color_schemes();
	}

	public function setUp() {
		parent::setUp();

		global $hook_suffix, $_wp_submenu_nopriv;

		$hook_suffix        = '';
		$_wp_submenu_nopriv = [];

		$this->current_user = get_current_user_id();
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function tearDown() {
		wp_set_current_user( $this->current_user );

		wp_dequeue_style( 'admin-menu-manager' );
		wp_dequeue_script( 'admin-menu-manager' );

		parent::tearDown();
	}

	public function test_get_admin_menu_empty() {
		$menu_items = admin_menu_manager()->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertEmpty( $menu_items );
	}

	public function test_get_admin_menu() {
		$menu_items = admin_menu_manager()->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertEmpty( $menu_items );

		$this->markTestIncomplete();
	}

	public function test_add_admin_menu() {
		$menu_items = admin_menu_manager()->get_admin_menu();
		$this->assertInternalType( 'array', $menu_items );
		$this->assertEmpty( $menu_items );

		$this->markTestIncomplete();
	}

	public function test_admin_enqueue_scripts_no_caps() {
		add_filter( 'amm_user_can_change_menu', '__return_false' );
		admin_menu_manager()->admin_enqueue_scripts();
		remove_filter( 'amm_user_can_change_menu', '__return_false' );

		$this->assertFalse( wp_style_is( 'admin-menu-manager', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'backbone-undo', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'admin-menu-manager', 'enqueued' ) );
	}

	public function test_admin_enqueue_scripts() {
		admin_menu_manager()->admin_enqueue_scripts();

		$this->assertTrue( wp_style_is( 'admin-menu-manager', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'backbone-undo', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'admin-menu-manager', 'enqueued' ) );
	}

	/**
	 * @covers Controller::get_inline_style
	 */
	public function test_get_inline_style() {
		wp_set_current_user( $this->current_user );
		admin_menu_manager()->admin_enqueue_scripts();

		$after = wp_styles()->get_data( 'admin-menu-manager', 'after' );

		$this->assertNotFalse( $after );
	}

	public function test_ajax_reset_menu() {
		wp_set_current_user( $this->current_user );

		update_user_option( wp_get_current_user()->ID, 'amm_menu', array() );
		update_user_option( wp_get_current_user()->ID, 'amm_submenu', array() );

		$ajax_handler = new \Required\Admin_Menu_Manager\Ajax_Handler();
		$ajax_handler->reset_menu();

		$this->assertFalse( get_user_option( 'amm_menu' ) );
		$this->assertFalse( get_user_option( 'amm_submenu' ) );
	}

	public function test_ajax_reset_menu_trash() {
		wp_set_current_user( $this->current_user );

		update_user_option( wp_get_current_user()->ID, 'amm_trash_menu', array() );
		update_user_option( wp_get_current_user()->ID, 'amm_trash_submenu', array() );

		$_REQUEST['type'] = 'trash';

		$ajax_handler = new \Required\Admin_Menu_Manager\Ajax_Handler();
		$ajax_handler->reset_menu();

		unset( $_REQUEST['type'] );

		$this->assertFalse( get_user_option( 'amm_trash_menu' ) );
		$this->assertFalse( get_user_option( 'amm_trash_submenu' ) );
	}
}
