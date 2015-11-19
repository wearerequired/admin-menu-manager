# Admin Menu Manager #
Contributors:      wearerequired, swissspidy  
Donate link:       http://required.ch  
Tags:              admin, menu, admin menus, dashboard, order  
Requires at least: 4.1  
Tested up to:      4.4  
Stable tag:        2.0.0  
License:           GPLv2 or later  
License URI:       http://www.gnu.org/licenses/gpl-2.0.html  

Manage the WordPress admin menu using a simple drag & drop interface.

## Description ##

At [required+](http://required.ch/ "Team of experienced web professionals from Switzerland & Germany") we strive to create a great user experience. We thought about how to improve the WordPress admin and came to the conclusion that we need a better way to manage the core of the WordPress back-end: the admin menu.

This is our take on a simple, lightweight and unobtrusive WordPress admin menu manager. It works like a charm, doesn’t get in your way and doesn’t even require yet another settings page. So if you want a custom tailored admin menu for you or your clients, this plugin is perfect.

**Pro tip:** Admin Menu Manager works perfectly to get Jetpack out of the way.

You can drag menu items anywhere you want, even from the top level to a sub menu item and vice-versa. Isn’t that awesome?!

**Highlights from version 2.0**

Version 2.0 is a major rewrite of the plugin with many new features, more robust code and various performance improvements.  Most notably, the menu settings are now saved on a per user basis and not globally. New features include:

* Import/Export functionality
* Trash: Completely remove (and restore) menu items
* Edit existing menu items and their icons
* Undo/Redo changes at will

**Demo**

Check out this quick [demo video](https://cloudup.com/cJM_wnxhlJo) of the plugin in action.

**Like what you see?**

Already using the Admin Menu Manager successfully and want to say thanks? Please consider [submitting a 5-star review](https://wordpress.org/plugins/admin-menu-manager/)!

## Installation ##

### Manual Installation ###

1. Upload the entire `/admin-menu-manager` directory to the `/wp-content/plugins/` directory.
2. Activate Admin Menu Manager through the 'Plugins' menu in WordPress.
3. Use the "Edit Menu" button to modify the WordPress admin menu.
4. Instantly love it.

## Frequently Asked Questions ##

### How can I move a top level item to the sub level? ###

Just drop the top level menu item (e.g. "Jetpack") on another menu item (e.g. "Settings") and it will automatically become a child of it.

### Can I prevent users from randomly changing their menu? ###

Yes! By using the `amm_user_can_change_menu` filter you can "lock" the current settings and disallow further edits.

### How can I save the menu settings globally instead of per user? ###

If you _don’t_ want per-user menu settings, you can hook into these actions/filters to manually handle saving/retrieving the settings (e.g. by using `get_site_option`):

* `amm_before_menu_update`
* `amm_before_menu_reset`
* `amm_menu_data`

This might get easier in the future or we just might create a little add-on for this plugin to handle this.

## Screenshots ##

1. The plugin adds an unobtrusive edit button to the admin menu.
2. Drag menu items and separators anywhere you want — even from sub menus to the top level and vice-versa!
3. You can even add custom items and separators, as well as export/import your settings.
4. Completely remove menu items and restore them when in need.

## Contribute ##

If you would like to contribute to this plugin, report an issue or anything like that, please note that we develop this plugin on [GitHub](https://github.com/wearerequired/admin-menu-manager). Please submit pull requests to the `develop` branch.

Developed by [required+](http://required.ch/ "Team of experienced web professionals from Switzerland & Germany").

## Changelog ##

### 2.0.0 ###
* Fixed: Dragging top level items to a sub menu should work again
* New: Complete rewrite of the plugin to make it more robust and future-proof
* New: Import/Export functionality
* New: Completely remove (and restore) menu items
* New: Edit existing menu items and their icons
* New: Undo/Redo changes at will

### 1.0.2 (2015-05-04) ###
* Fixed: Localized sub menu items didn’t work properly due do wrongly translated strings.

### 1.0.1 (2015-4-27) ###
* Fix JS URL that made the plugin un-usable

### 1.0.0 (2015-4-27) ###
* First release

## Upgrade Notice ##

### 2.0.0 ###
Major release with many new features like editing and removing menu items. Grab it while it’s hot!

### 1.0.2 ###
This version contains a fix for sub menu items that didn’t appear to work on localized sites.

### 1.0.1 ###
Fix JS URL that made the plugin un-usable. Sorry!

### 1.0.0 ###
First release