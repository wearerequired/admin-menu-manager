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
	protected $new_menu;
	protected $old_menu;
	protected $old_submenu;

	public function __construct( array &$new_menu, array &$old_menu, array &$old_submenu ) {
		$this->new_menu = $new_menu;
		$this->old_menu = $old_menu;
		$this->old_submenu = $old_submenu;
	}

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

			preg_match( '/page=([a-z_0-9]*)/', $item['href'], $matches );
			if ( isset( $matches[1] ) ) {
				$item_slug = $matches[1];
			}
		}

		return $item_slug;
	}

	protected function is_top_level_item( $item, $priority ) {
		global $menu;

		$item_slug = $this->get_menu_item_slug( $item );

		// It was originally a top level item as well. It's a match!
		foreach ( $this->new_menu as $key => $m_item ) {
			if ( $item_slug !== $m_item[2] ) {
				continue;
			}

			if ( $this->is_menu_separator( $m_item ) ) {
				$menu[] = $m_item;
			} else {
				add_menu_page(
					$m_item[3], // Page title.
					$m_item[0], // Menu title.
					$m_item[1], // Capability.
					$item_slug, // Slug.
					'', // Function.
					$m_item[6], // Icon.
					$priority // Position.
				);

				if ( isset( $amm_submenu[ $m_item[2] ] ) ) {
					$amm_submenu[ $item_slug ] = $amm_submenu[ $m_item[2] ];
				}
			}

			unset( $this->new_menu[ $key ] );

			return true;
		}

		return false;
	}

	protected function is_submenu_item( $item, $priority ) {
		global $menu;

		$item_slug = $this->get_menu_item_slug( $item );

		foreach ( $this->old_submenu as $key => $parent ) {
			foreach ( $parent as $sub_key => $sub_item ) {
				if ( $item_slug !== $sub_item[2] ) {
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

				unset( $this->old_submenu[ $key ][ $sub_key ] );

				return true;
			}
		}

		return false;
	}

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
}