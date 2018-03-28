<?php
/**
 * Holds the Sub_Menu_Iterator class.
 *
 * @package Required\Admin_Menu_Manager
 */

namespace Required\Admin_Menu_Manager;

/**
 * Sub menu items iterator.
 */
class Sub_Menu_Iterator extends Menu_Iterator {
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
	 * The new sub menu.
	 *
	 * @var array
	 */
	protected $new_submenu;

	/**
	 * The old sub menu.
	 *
	 * @var array
	 */
	protected $old_submenu;

	/**
	 * Sub menu iterator constructor.
	 *
	 * @param array $new_menu The new admin menu.
	 * @param array $old_menu The old admin menu, passed by reference.
	 * @param array $new_submenu The new sub menu.
	 * @param array $old_submenu The old sub menu, passed by reference.
	 */
	public function __construct( array $new_menu, array &$old_menu, array $new_submenu, array &$old_submenu ) {
		$this->new_menu    = $new_menu;
		$this->old_menu    = &$old_menu;
		$this->new_submenu = $new_submenu;
		$this->old_submenu = &$old_submenu;
	}

	/**
	 * Determines whether an item is actually a top level menu item or not.
	 *
	 * @param array  $item        Menu item array.
	 * @param string $parent_page The item's parent page.
	 *
	 * @return bool True if it's a top level menu item, false otherwise.
	 */
	protected function is_top_level_item( $item, $parent_page ) {
		global $submenu;

		$item_slug = $this->get_menu_item_slug( $item );

		// Iterate on original top level menu items.
		foreach ( $this->old_menu as $m_key => $m_item ) {
			if ( $item_slug !== $this->get_menu_item_slug( $m_item ) ) {
				continue;
			}

			$hook_name = get_plugin_page_hookname( $m_item[2], $parent_page );

			$new_page = add_submenu_page(
				$parent_page, // Parent Slug.
				$m_item[0], // Page title.
				$m_item[0], // Menu title.
				$m_item[1], // Capability.
				$m_item[2] // Slug.
			);

			// Don't loose grand children.
			if ( isset( $this->old_submenu[ $m_item[2] ] ) ) {
				foreach ( $this->old_submenu[ $m_item[2] ] as $s_item ) {
					$hook_name = get_plugin_page_hookname( $s_item[2], $m_item[2] );

					$new_page = add_submenu_page(
						$parent_page, // Parent Slug.
						$s_item[3], // Page title.
						$s_item[0], // Menu title.
						$s_item[1], // Capability.
						$s_item[2] // Slug.
					);

					$this->switch_menu_item_filters( $hook_name, $new_page );

					// Add original parent slug to sub menu item.
					end( $submenu[ $parent_page ] );
					$submenu[ $parent_page ][ key( $submenu[ $parent_page ] ) ]['original_parent'] = $m_item[2];

					unset( $s_item );
				}
			}

			$this->switch_menu_item_filters( $hook_name, $new_page );

			unset( $this->old_menu[ $m_key ] );

			return true;
		}

		return false;
	}

	/**
	 * Determines whether an item is really a sub menu item or not.
	 *
	 * @param array  $item        Menu item array.
	 * @param string $parent_page The item's parent page.
	 *
	 * @return bool True if it's a sub menu item, false otherwise.
	 */
	protected function is_submenu_item( $item, $parent_page ) {
		$item_slug = $this->get_menu_item_slug( $item );

		// Iterate on original submenu items.
		foreach ( $this->old_submenu as $s_parent_page => &$s_page ) {
			foreach ( $s_page as $s_priority => &$s_item ) {
				if ( $item_slug !== $this->get_menu_item_slug( $s_item ) ) {
					continue;
				}

				if ( $item_slug === $s_parent_page && 1 <= count( $s_page ) && false !== strpos( $item[4], 'toplevel_page' ) ) {
					continue;
				}

				$hook_name = get_plugin_page_hookname( $s_item[2], $s_parent_page );

				$new_page = add_submenu_page(
					$parent_page, // Parent Slug.
					isset( $item[3] ) ? $item[3] : $item[0], // Page title.
					$item[0], // Menu title.
					$item[1], // Capability.
					$item[2] // Slug.
				);

				$this->switch_menu_item_filters( $hook_name, $new_page );

				unset( $this->old_submenu[ $s_parent_page ][ $s_priority ] );

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
	 * @param array  $item        Menu item array.
	 * @param string $parent_page The item's parent page.
	 *
	 * @return bool True if it's a custom menu item, false otherwise.
	 */
	protected function is_custom_menu_item( $item, $parent_page ) {
		global $submenu;

		// It must be a custom menu item.
		if ( isset( $item['id'] ) && false !== strpos( $item['id'], 'custom-item' ) ) {
			$submenu[ $parent_page ][] = [
				0    => $item[0],
				1    => $item[1],
				2    => $item['href'],
				'id' => $item['id'],
			];

			return true;
		}

		return false;
	}

	/**
	 * Tries to match menu items that are both in the new and the old sub menu.
	 */
	public function maybe_match_menu_items() {
		foreach ( $this->new_submenu as $parent_page => $page ) {
			$this->maybe_match_submenu_item( $page, $parent_page );
		}
	}

	/**
	 * Tries to match a menu item with its original entry.
	 *
	 * Checks submenu items first as this is the most likely case.
	 *
	 * @param array $page        The submenu item.
	 * @param int   $parent_page The item's parent.
	 */
	protected function maybe_match_submenu_item( $page, $parent_page ) {
		global $submenu;

		foreach ( $page as $item ) {
			if ( $this->is_submenu_item( $item, $parent_page ) ) {
				continue;
			}

			if ( $this->is_top_level_item( $item, $parent_page ) ) {
				continue;
			}

			if ( $this->is_custom_menu_item( $item, $parent_page ) ) {
				continue;
			}

			// It must be a separator.
			if ( $this->is_menu_separator( $item ) ) {
				$submenu[ $parent_page ][] = $item;
				continue;
			}
		}
	}
}
