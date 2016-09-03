<?php
/**
 * Holds the ajax handler.
 *
 * @package Required\Admin_Menu_Manager
 */
namespace Required\Admin_Menu_Manager;

/**
 * Ajax requests handler.
 */
class Ajax_Handler {
	/**
	 * General Ajax Handler.
	 *
	 * Works for saving and resetting the menu.
	 */
	public function receive() {
		/* This filter is documented in classes/class-admin-menu-manager.php */
		if ( ! apply_filters( 'amm_user_can_change_menu', current_user_can( 'read' ) ) ) {
			return;
		}

		if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			$this->update_menu();
		} else if ( 'DELETE' === $_SERVER['REQUEST_METHOD'] ) {
			$this->reset_menu();
		}

		die( 1 );
	}

	/**
	 * Update the menu.
	 *
	 * The passed array is split up in a menu and submenu array,
	 * just like WordPress uses it in the backend.
	 */
	public function update_menu() {
		$data = json_decode( file_get_contents( 'php://input' ), true );

		if ( ! is_array( $data ) || empty( $data ) ) {
			die( 1 );
		}

		$menu = $this->update_menu_loop( $data );
		$type = isset( $_REQUEST['type'] ) && 'trash' === $_REQUEST['type'] ? 'trash' : 'menu';

		/**
		 * Runs before the menu is updated.
		 *
		 * Use this hook to modify the menu before it's saved.
		 *
		 * @since 2.0.0
		 *
		 * @param string $type Either 'trash' or 'menu'.
		 * @param array  $menu The menu data.
		 */
		do_action( 'amm_before_menu_update', $type, $menu );

		if ( 'trash' === $type ) {
			update_user_option( wp_get_current_user()->ID, 'amm_trash_menu', $menu['menu'], false );
			update_user_option( wp_get_current_user()->ID, 'amm_trash_submenu', $menu['submenu'], false );
		} else {
			update_user_option( wp_get_current_user()->ID, 'amm_menu', $menu['menu'], false );
			update_user_option( wp_get_current_user()->ID, 'amm_submenu', $menu['submenu'], false );
		}
	}

	/**
	 * Loop through all menu items to update the menu.
	 *
	 * @param array $menu The new admin menu data.
	 *
	 * @return array An array containing top level and sub level menu items.
	 */
	protected function update_menu_loop( $menu ) {
		$items   = [];
		$submenu = [];

		$separatorIndex = 1;
		$last_separator = null;

		foreach ( $menu as $item ) {
			if ( false !== strpos( $item[2], '=' ) ) {
				$item[2] = str_replace( '=', '', strstr( $item[2], '=' ) );
			}

			$item = [
				0          => wp_unslash( $item[0] ),
				1          => $item[1],
				2          => $item[2],
				3          => $item[3],
				4          => $item[4],
				5          => $item[5],
				6          => $item[6],
				'children' => isset( $item['children'] ) ? $item['children'] : [],
				'href'     => $item['href'],
				'id'       => $item['id'],
			];

			if ( ! empty( $item['children'] ) ) {
				// Todo: Ensure $item[2] is correct for things like 'edit.php?post_type=page'
				$submenu[ $item[2] ] = [];
				foreach ( $item['children'] as $subitem ) {
					if ( false !== strpos( $subitem[2], '=' ) ) {
						$subitem[2] = str_replace( '=', '', strstr( $subitem[2], '=' ) );
					}

					$subitem = [
						0      => wp_unslash( $subitem[0] ),
						1      => $subitem[1],
						2      => $subitem[2],
						3      => $subitem[3],
						4      => $subitem[4],
						'href' => $subitem['href'],
						'id'   => $subitem['id'],
					];

					$submenu[ $item[2] ][] = $subitem;
				}
				unset( $item['children'] );
			}

			// Store separators in correct order.
			if ( false !== strpos( $item[2], 'separator' ) ) {
				$item           = [ '', 'read', 'separator' . $separatorIndex ++, '', 'wp-menu-separator' ];
				$last_separator = count( $items );
			}

			$items[] = $item;
		}

		if ( null !== $last_separator ) {
			$items[ $last_separator ][2] = 'separator-last';
		}

		return [
			'menu'    => $items,
			'submenu' => $submenu,
		];
	}

	/**
	 * Reset the menu completely.
	 */
	public function reset_menu() {
		$type = isset( $_REQUEST['type'] ) && 'trash' === $_REQUEST['type'] ? 'trash' : 'menu';

		/**
		 * Fires before the menu is reset.
		 *
		 * @since 2.0.0
		 *
		 * @param string $type Either 'trash' or 'menu'.
		 */
		do_action( 'amm_before_menu_reset', $type );

		if ( 'trash' === $type ) {
			delete_user_option( wp_get_current_user()->ID, 'amm_trash_menu' );
			delete_user_option( wp_get_current_user()->ID, 'amm_trash_submenu' );
		} else {
			delete_user_option( wp_get_current_user()->ID, 'amm_menu' );
			delete_user_option( wp_get_current_user()->ID, 'amm_submenu' );
		}
	}
}
