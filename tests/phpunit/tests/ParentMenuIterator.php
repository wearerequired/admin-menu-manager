<?php

/**
 * Compare menu structures.
 *
 * 0 = menu_title, 1 = capability, 2 = menu_slug, 3 = page_title, 4 = classes, 5 = hook name, 6 = icon
 */
class ParentMenuIterator_Test extends WP_UnitTestCase {
	public function test_parent_menu_iterator() {
		global $menu;

		$new_menu = [
			0 => [
				0 => 'Lorem Ipsum',
				1 => 'edit_options',
				2 => 'lorem-ipsum',
				3 => 'Lorem Ipsum',
				4 => 'lorem ipsum dolor',
				5 => 'toplevel_page_lorem',
				6 => 'dashicons-dashboard',
			],
			10 => [
				0 => 'Foo',
				1 => 'edit_options',
				2 => 'nomatch',
				3 => 'Foo Settings',
				4 => 'foo bar baz',
				5 => 'toplevel_page_foo',
				6 => 'dashicons-random',
			],
			20 => [
				0      => 'Bar <span>Baz</span>',
				1      => 'install_plugins',
				2      => 'bar',
				3      => 'Bar Settings',
				4      => 'bar',
				5      => 'toplevel_page_barpage',
				6      => 'dashicons-admin-tools',
				'href' => 'themes.php?page=bar',
			],
		];

		$old_menu = [
			40 => [
				0      => 'Bar <span>Baz</span>',
				1      => 'install_plugins',
				2      => 'bar',
				3      => 'Bar Settings',
				4      => 'bar',
				5      => 'toplevel_page_barpage',
				6      => 'dashicons-dashboard',
				'href' => 'themes.php?page=bar',
			],
			80 => [
				0 => 'Old Foo',
				1 => 'edit_options',
				2 => 'old-foo',
				3 => 'Old Foo Settings',
				4 => 'old foo bar baz',
				5 => 'toplevel_page_foo',
				6 => 'dashicons-admin-users',
			],
			0 => [
				0 => 'WordPress',
				1 => 'edit_options',
				2 => 'lorem-ipsum',
				3 => 'WordPress',
				4 => 'wordpress word press',
				5 => 'toplevel_page_wordpress',
				6 => 'dashicons-dashboard',
			],
		];

		$old_submenu = [];

		$iterator = new \Required\Admin_Menu_Manager\Parent_Menu_Iterator( $new_menu, $old_menu, $old_submenu );
		$iterator->maybe_match_menu_items();
		$this->assertSame( [
			0 => [
				0 => 'Lorem Ipsum',
				1 => 'edit_options',
				2 => 'lorem-ipsum',
				3 => 'Lorem Ipsum',
				4 => 'menu-top toplevel_page_lorem-ipsum',
				5 => 'toplevel_page_lorem-ipsum',
				6 => 'dashicons-dashboard',
			],
			20 => [
				0 => 'Bar <span>Baz</span>',
				1 => 'install_plugins',
				2 => 'bar',
				3 => 'Bar Settings',
				4 => 'menu-top toplevel_page_bar',
				5 => 'toplevel_page_bar',
				6 => 'dashicons-admin-tools',
			],
		], $menu );
	}
}
