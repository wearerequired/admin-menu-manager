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
abstract class Menu_Iterator {
	/**
	 * Tries to match menu items that are both in the new and the old menu.
	 */
	public abstract function maybe_match_menu_items();

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

	/**
	 * Get the slug of a menu item.
	 *
	 * @param array $item Menu item.
	 *
	 * @return string
	 */
	protected function get_menu_item_slug( $item ) {
		$item_slug = $item[2];

		if ( isset( $item['href'] ) ) {
			$item_slug = $item['href'];

			preg_match( '/page=([a-z_\-0-9]*)/', $item['href'], $matches );
			if ( isset( $matches[1] ) ) {
				$item_slug = $matches[1];
			}
		}

		return $item_slug;
	}
}
