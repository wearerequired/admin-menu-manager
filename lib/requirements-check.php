<?php

/**
 * Simple requirements checking class.
 */
class Admin_Menu_Manager_Requirements_Check {
	private $title = '';
	private $php = '5.2.4';
	private $wp = '3.8';
	private $file;

	/**
	 * Constructor.
	 *
	 * @param array $args An array of arguments to overwrite the default requirements.
	 */
	public function __construct( $args ) {
		foreach ( array( 'title', 'php', 'wp', 'file' ) as $setting ) {
			if ( isset( $args[ $setting ] ) ) {
				$this->$setting = $args[ $setting ];
			}
		}
	}

	/**
	 * @return bool True if the install passes the requirements, false otherwise.
	 */
	public function passes() {
		$passes = $this->php_passes() && $this->wp_passes();
		if ( ! $passes ) {
			add_action( 'admin_notices', array( $this, 'deactivate' ) );
		}

		return $passes;
	}

	/**
	 * Deactivate the plugin again.
	 */
	public function deactivate() {
		if ( isset( $this->file ) ) {
			deactivate_plugins( plugin_basename( $this->file ) );
		}
	}

	/**
	 * @return bool True if the PHP version is high enough, false otherwise.
	 */
	private function php_passes() {
		if ( $this->__php_at_least( $this->php ) ) {
			return true;
		} else {
			add_action( 'admin_notices', array( $this, 'php_version_notice' ) );

			return false;
		}
	}

	/**
	 * Compare the current PHP version with the minimum required version.
	 */
	private static function __php_at_least( $min_version ) {
		return version_compare( phpversion(), $min_version, '>=' );
	}

	/**
	 * Show the PHP version notice.
	 */
	public function php_version_notice() {
		?>
		<div class="error">
			<p><?php printf( 'The &#8220;%s&#8221; plugin cannot run on PHP versions older than %s. Please contact your host and ask them to upgrade.', esc_html( $this->title ), $this->php ); ?></p>
		</div>
		<?php
	}

	/**
	 * @return bool True if the WordPress version is high enough, false otherwise.
	 */
	private function wp_passes() {
		if ( $this->__wp_at_least( $this->wp ) ) {
			return true;
		} else {
			add_action( 'admin_notices', array( $this, 'wp_version_notice' ) );

			return false;
		}
	}

	/**
	 * Compare the current WordPress version with the minimum required version.
	 */
	private static function __wp_at_least( $min_version ) {
		return version_compare( get_bloginfo( 'version' ), $min_version, '>=' );
	}

	/**
	 * SHow the WordPress version notice.
	 */
	public function wp_version_notice() {
		?>
		<div class="error">
			<p><?php printf( 'The &#8220;%s&#8221; plugin cannot run on WordPress versions older than %s. Please update WordPress.', esc_html( $this->title ), $this->wp ); ?></p>
		</div>
		<?php
	}
}
