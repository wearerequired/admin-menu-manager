<?php
/**
 * Holds the parent menu items iterator.
 *
 * @package Required\Admin_Menu_Manager
 */

namespace Required\Admin_Menu_Manager;

/**
 * (Parent) menu items iterator.
 */
class Parent_Menu_Iterator extends Menu_Iterator {
	/**
	 * The new admin menu.
	 *
	 * @var array
	 */
	protected $new_menu;

	/**
	 * The old admin menu.
	 *
	 * @var array
	 */
	protected $old_menu;

	/**
	 * The old sub menu.
	 *
	 * @var array
	 */
	protected $old_submenu;

	/**
	 * Parent menu iterator constructor.
	 *
	 * @param array $new_menu The new admin menu.
	 * @param array $old_menu The old admin menu, passed by reference.
	 * @param array $old_submenu The old sub menu, passed by reference.
	 */
	public function __construct( array $new_menu, array &$old_menu, array &$old_submenu ) {
		$this->new_menu = $new_menu;
		$this->old_menu = &$old_menu;
		$this->old_submenu = &$old_submenu;
	}

	/**
	 * Determines whether an item is really a top level menu item or not.
	 *
	 * @param array $item     Menu item array.
	 * @param int   $priority The item's priority.
	 *
	 * @return bool True if it's a top level menu item, false otherwise.
	 */
	protected function is_top_level_item( $item, $priority ) {
		global $menu;

		$item_slug = $this->get_menu_item_slug( $item );

		// It was originally a top level item as well. It's a match!
		foreach ( $this->old_menu as $m_item ) {
			if ( $item_slug !== $this->get_menu_item_slug( $m_item ) ) {
				continue;
			}

			if ( $this->is_menu_separator( $m_item ) ) {
				$menu[] = $m_item;
			} else {
				add_menu_page(
					$item[3], // Page title.
					$item[0], // Menu title.
					$item[1], // Capability.
					$item_slug, // Slug.
					'', // Function.
					$item[6], // Icon.
					$priority // Position.
				);

				if ( isset( $amm_submenu[ $m_item[2] ] ) ) {
					$amm_submenu[ $item_slug ] = $amm_submenu[ $m_item[2] ];
				}
			}

			// We can't do a simple unset() as the key is likely not the same.
			foreach ( $this->old_menu as $old_key => $old_item ) {
				if ( $item_slug === $old_item[2] ) {
					unset( $this->old_menu[ $old_key ] );
					break;
				}
			}

			return true;
		}

		return false;
	}

	/**
	 * Determines whether an item is actually a sub menu item or not.
	 *
	 * @param array $item     Menu item array.
	 * @param int   $priority The item's priority.
	 *
	 * @return bool True if it's a sub menu item, false otherwise.
	 */
	protected function is_submenu_item( $item, $priority ) {
		global $menu;

		$item_slug = $this->get_menu_item_slug( $item );

		foreach ( $this->old_submenu as $key => $parent ) {
			foreach ( $parent as $sub_key => $sub_item ) {
				if ( $item_slug !== $this->get_menu_item_slug( $sub_item ) ) {
					continue;
				}

				$hook_name = get_plugin_page_hookname( $sub_item[2], $key );

				if ( ! isset( $sub_item[3] ) ) {
					$sub_item[3] = $sub_item[0];
				}

				$new_page = add_menu_page(
					$sub_item[3], // Page title.
					$sub_item[0], // Menu title.
					$sub_item[1], // Capability.
					$sub_item[2], // Slug.
					'', // Function.
					$item[6], // Icon.
					$priority // Position.
				);

				// Add hook name of the former parent as CSS class to the new item.
				$menu[ $priority ][4] .= ' ' . get_plugin_page_hookname( $key, $key );

				$this->switch_menu_item_filters( $hook_name, $new_page );

				// We can't do a simple unset() as the key is likely not the same.
				foreach ( $this->old_submenu[ $key ][ $sub_key ] as $old_key => $old_item ) {
					if ( $item_slug === $old_item[2] ) {
						unset( $this->old_submenu[ $key ][ $sub_key ][ $old_key ] );
						break;
					}
				}

				return true;
			}
		}

		return false;
	}

	/**
	 * Determines whether an item is a custom menu item or not.
	 *
	 * Custom items have 'custom-item' in their ID.
	 *
	 * @param array $item Menu item array.
	 *
	 * @return bool True if it's a custom menu item, false otherwise.
	 */
	protected function is_custom_menu_item( $item ) {
		global $menu;

		if ( isset( $item['id'] ) && false !== strpos( $item['id'], 'custom-item' ) ) {
			$menu[] = [
				0    => $item[0],
				1    => $item[1],
				2    => $item['href'],
				3    => $item[3],
				4    => $item[4],
				5    => $item[5],
				6    => $item[6],
				'id' => $item['id'],
			];

			return true;
		}

		return false;
	}

	/**
	 * Tries to match menu items that are both in the new and the old menu.
	 */
	public function maybe_match_menu_items() {
		// Iterate on the top level items.
		foreach ( $this->new_menu as $priority => $item ) {
			$this->maybe_match_top_level_menu_item( $item, $priority );
		}
	}

	/**
	 * Try to match a menu item with its original entry.
	 *
	 * @param array $item     The menu item.
	 * @param int   $priority The item's priority in the menu.
	 */
	protected function maybe_match_top_level_menu_item( $item, $priority ) {
		global $menu;

		// It was originally a top level item as well. It's a match!
		if ( $this->is_top_level_item( $item, $priority ) ) {
			return;
		}

		// It must be a submenu item moved to the top level.
		if ( $this->is_submenu_item( $item, $priority ) ) {
			return;
		}

		if ( $this->is_custom_menu_item( $item ) ) {
			return;
		}

		// It must be a separator.
		if ( $this->is_menu_separator( $item ) ) {
			$menu[] = $item;

			return;
		}
	}
}
