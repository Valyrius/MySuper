import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class MySuperPref extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page and group
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        page.add(group);

        // Create a new preferences row
        const row = new Adw.ActionRow({ title: 'Super key command' });
        group.add(row);

        // Create the switch and bind its value to the `overlay-key-action` key
        window._settings = this.getSettings();
        const textField = new Gtk.Entry({
            text: window._settings.get_string('overlay-key-action'),
            valign: Gtk.Align.CENTER,
        });

        window._settings.bind(
            'overlay-key-action',
            textField,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Add the switch to the row
        row.add_suffix(textField);

        // Add our page to the window
        window.add(page);
    }
}
