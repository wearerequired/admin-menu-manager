<?php
/**
 * Holds the data provider.
 *
 * @package Required\Admin_Menu_Manager
 */

namespace Required\Admin_Menu_Manager;

/**
 * Provider of all the data sent in the background.
 */
class Data_Provider {
	/**
	 * Returns the inline script data for use by `wp_localize_script`
	 *
	 * @return array
	 */
	public function get_data() {
		global $parent_file, $submenu_file;

		$plugin_page = null;

		if ( isset( $_GET['page'] ) ) {
			$plugin_page = sanitize_text_field( wp_unslash( $_GET['page'] ) );
			$plugin_page = plugin_basename( $plugin_page );
		}

		return [
			'templates'    => [
				'editButton'      => [
					'label'       => __( 'Edit Menu', 'admin-menu-manager' ),
					'labelSaving' => __( 'Saving&hellip;', 'admin-menu-manager' ),
					'labelSaved'  => __( 'Saved!', 'admin-menu-manager' ),
					'options'     => [
						'save'          => __( 'Save changes', 'admin-menu-manager' ),
						'add'           => __( 'Options', 'admin-menu-manager' ),
						'addSeparator'  => __( 'Add separator', 'admin-menu-manager' ),
						'addCustomItem' => __( 'Add menu item', 'admin-menu-manager' ),
						'addImport'     => __( 'Import menu', 'admin-menu-manager' ),
						'addExport'     => __( 'Export menu', 'admin-menu-manager' ),
						'undo'          => __( 'Undo change', 'admin-menu-manager' ),
						'redo'          => __( 'Redo change', 'admin-menu-manager' ),
						'reset'         => __( 'Reset menu', 'admin-menu-manager' ),
					],
				],
				'exportModal'     => [
					'close'       => _x( 'Close', 'modal close button', 'admin-menu-manager' ),
					'title'       => __( 'Export', 'admin-menu-manager' ),
					'description' => __( 'Export your menu data to another site. Copy the text below:', 'admin-menu-manager' ),
					'formLabel'   => _x( 'Menu data', 'form label', 'admin-menu-manager' ),
					'buttonText'  => _x( 'Done', 'button text', 'admin-menu-manager' ),
				],
				'importModal'     => [
					'close'       => _x( 'Close', 'modal close button', 'admin-menu-manager' ),
					'title'       => __( 'Import', 'admin-menu-manager' ),
					'description' => __( 'Import your menu data from another site. Insert the data here:', 'admin-menu-manager' ),
					'formLabel'   => _x( 'Menu data', 'form label', 'admin-menu-manager' ),
					'buttonText'  => _x( 'Import', 'button text', 'admin-menu-manager' ),
				],
				'collapseButton'  => [
					'label'     => __( 'Collapse menu', 'admin-menu-manager' ),
					'ariaLabel' => __( 'Collapse Main menu', 'admin-menu-manager' ),
				],
				'menuItemOptions' => [
					'title'      => __( 'Edit item', 'admin-menu-manager' ),
					'labelLabel' => __( 'Label:', 'admin-menu-manager' ),
					'iconLabel'  => __( 'Icon:', 'admin-menu-manager' ),
					'linkLabel'  => __( 'Link:', 'admin-menu-manager' ),
					'save'       => __( 'Save', 'admin-menu-manager' ),
				],
			],
			'parent_file'  => $parent_file,
			'submenu_file' => $submenu_file,
			'plugin_page'  => $plugin_page,
			'menu'         => admin_menu_manager()->get_admin_menu(),
			'trash'        => admin_menu_manager()->get_admin_menu_trash(),
		];
	}
}
