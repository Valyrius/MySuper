import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

let signal_overlay_key = null;
let original_signal_overlay_key = null;
let settings = null;

// Overlay-key
var overlay_key_action = null;

export default class MySuper extends Extension {

    // Overview functions
    overview_visible() {
        return Main.overview.visibleTarget;
    }

    overview_hide() {
        if (Main.overview.animationInProgress) {
            // prevent accidental re-show
        } else if (this.overview_visible()) {
            Main.overview.hide();
        }
    }

    overlay_key() {
        this.overview_hide();
        let proc = new Gio.Subprocess({argv: overlay_key_action.split(' ')});
        proc.init(null);
    }

    overlay_key_changed(settings) {
        this.overview_hide();
        overlay_key_action = settings.get_string("overlay-key-action");
    }

    init(metadata) {}

    enable() {
        settings = this.getSettings((this.metadata["settings-schema"]));

        // Load overlay key action and keep it up to date with settings
        this.overlay_key_changed(settings);
        settings.connect("changed::overlay-key-action", () => {
            this.overlay_key_changed(settings);
        });

        // Block original overlay key handler
        original_signal_overlay_key = GObject.signal_handler_find(global.display, { signalId: "overlay-key" });
        if (original_signal_overlay_key !== null) {
            global.display.block_signal_handler(original_signal_overlay_key);
        }

        // Connect modified overlay key handler
        const A11Y_SCHEMA = 'org.gnome.desktop.a11y.keyboard';
        const STICKY_KEYS_ENABLE = 'stickykeys-enable';
        let _a11ySettings = new Gio.Settings({ schema_id: A11Y_SCHEMA });
        signal_overlay_key = global.display.connect("overlay-key", () => {
            if (!_a11ySettings.get_boolean(STICKY_KEYS_ENABLE))
                this.overlay_key();
        });
    }

    disable() {

        // Disconnect modified overlay key handler
        if (signal_overlay_key !== null) {
            global.display.disconnect(signal_overlay_key);
            signal_overlay_key = null;
        }

        // Unblock original overlay key handler
        if (original_signal_overlay_key !== null) {
            global.display.unblock_signal_handler(original_signal_overlay_key);
            original_signal_overlay_key = null;
        }

        settings =  null;
    }
}
