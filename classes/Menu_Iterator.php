<?php
/**
 * Holds the main Menu_Iterator class.
 *
 * @package Required\Admin_Menu_Manager
 */
namespace Required\Admin_Menu_Manager;

/**
 * Base menu items iterator.
 */
class Menu_Iterator {
	/**
	 * Get all the filters hooked to an admin menu page.
	 *
	 * @param string $hook_name The plugin page hook name.
	 *
	 * @return array
	 */
	protected function get_menu_item_filters( $hook_name ) {
		global $wp_filter;

		$old_filters = [];

		foreach ( $wp_filter as $filter => $value ) {
			if ( false !== strpos( $filter, $hook_name ) ) {
				$old_filters[ $filter ] = $value;
				unset( $wp_filter[ $filter ] );
			}
		}

		return $old_filters;
	}

	/**
	 * Add the hooks attached to the original menu item to the new one.
	 *
	 * @param string $old_hook Old hook name.
	 * @param string $new_hook New hook name.
	 */
	protected function switch_menu_item_filters( $old_hook, $new_hook ) {
		global $wp_filter;

		foreach ( $this->get_menu_item_filters( $old_hook ) as $filter => $value ) {
			$wp_filter[ str_replace( $old_hook, $new_hook, $filter ) ] = $value;
		}
	}

	/**
	 * Check if a menu item is a menu separator.
	 *
	 * @param array $item Top-level or sub-level menu item.
	 *
	 * @return bool
	 */
	protected function is_menu_separator( $item ) {
		return isset( $item[4] ) && 'wp-menu-separator' === $item[4];
	}
}