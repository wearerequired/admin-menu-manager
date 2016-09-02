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
	protected $new_submenu;
	protected $new_menu;
	protected $old_submenu;

	public function __construct( array $new_submenu, array $new_menu, array &$old_submenu ) {
		$this->new_submenu = $new_submenu;
		$this->new_menu    = $new_menu;
		$this->old_submenu = &$old_submenu;
	}

	public function maybe_match_menu_items() {
		foreach ( $this->new_submenu as $parent_page => $page ) {
			$this->maybe_match_submenu_item( $page, $parent_page );
		}
	}

	protected function is_top_level_item( $item, $parent_page ) {
		global $submenu;

		$item_slug = $this->get_menu_item_slug( $item );

		// Iterate on original top level menu items.
		foreach ( $this->new_menu as $m_key => $m_item ) {
			if ( $item_slug !== $m_item[2] ) {
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
			if ( isset( $temp_submenu[ $m_item[2] ] ) ) {
				foreach ( $temp_submenu[ $m_item[2] ] as $s_item ) {
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

			// We can't do a simple unset() as the key is likely not the same.
			foreach( $this->new_menu as $new_key => $new_item ) {
				if ( $item_slug === $new_item[2] ) {
					unset( $this->new_menu[ $new_key ] );
					break;
				}
			}

			return true;
		}

		return false;
	}

	protected function is_submenu_item( $item, $parent_page ) {
		$item_slug = $this->get_menu_item_slug( $item );

		// Iterate on original submenu items.
		foreach ( $this->new_submenu as $s_parent_page => &$s_page ) {
			foreach ( $s_page as $s_priority => &$s_item ) {
				if ( $item_slug !== $s_item[2] ) {
					continue;
				}

				$hook_name = get_plugin_page_hookname( $s_item[2], $s_parent_page );

				$new_page = add_submenu_page(
					$parent_page, // Parent Slug.
					isset( $s_item[3] ) ? $s_item[3] : $s_item[0], // Page title.
					$s_item[0], // Menu title.
					$s_item[1], // Capability.
					$s_item[2] // Slug.
				);

				$this->switch_menu_item_filters( $hook_name, $new_page );

				// We can't do a simple unset() as the key is likely not the same.
				foreach ( $this->old_submenu[ $s_parent_page ] as $key => $new_item ) {
					if ( $item_slug === $new_item[2] ) {
						unset( $this->old_submenu[ $s_parent_page ][ $key ] );
						break;
					}
				}

				return true;
			}
		}

		return false;
	}

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
	 * Try to match a menu item with its original entry.
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
