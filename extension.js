import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

let signal_overlay_key = null;
let original_signal_overlay_key = null;
let settings = null;
let overlay_key_action = null;

export default class MySuper extends Extension {

    viewHide() {
        if (Main.overview.visibleTarget || Main.overview.animationInProgress) {
            Main.overview.hide();
        }}

    overlayKey() {
        this.viewHide();
        const proc = new Gio.Subprocess({argv: overlay_key_action.split(' ')});
        proc.init(null);
    }

    init(metadata) {}

    enable() {
        // Load overlay key action and keep it up to date with settings
        settings = this.getSettings((this.metadata["settings-schema"]));
        overlay_key_action = settings.get_string("overlay-key-action");
        settings.connect("changed::overlay-key-action", () => {
            overlay_key_action = settings.get_string("overlay-key-action");
        });

        // Block original overlay key handler
        original_signal_overlay_key = GObject.signal_handler_find(global.display, { signalId: "overlay-key" });
        if (original_signal_overlay_key !== null) {
            global.display.block_signal_handler(original_signal_overlay_key);
        }

        // Connect modified overlay key handler
        const A11Y_SCHEMA = 'org.gnome.desktop.a11y.keyboard';
        const STICKY_KEYS_ENABLE = 'stickykeys-enable';
        const _a11ySettings = new Gio.Settings({ schema_id: A11Y_SCHEMA });
        signal_overlay_key = global.display.connect("overlay-key", () => {
            if (!_a11ySettings.get_boolean(STICKY_KEYS_ENABLE))
                this.overlayKey();
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
