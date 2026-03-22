import { Modifier, ParsedKey } from "./types"

/**
 * Normalizes a live KeyboardEvent into a ParsedKey.
 *
 * This is the counterpart to parseShortcut() — parseShortcut() converts
 * a user-defined string into a ParsedKey, and normalizeEvent() converts
 * a live browser event into a ParsedKey. The two can then be compared.
 *
 * We use KeyboardEvent.key exclusively — NOT keyCode, which, or code.
 * This ensures correct behavior on international and alternative layouts.
 */
export function normalizeEvent(event: KeyboardEvent): ParsedKey {
    const modifiers = new Set<Modifier>()

    if (event.ctrlKey) modifiers.add("ctrl")

    if (event.shiftKey) modifiers.add("shift")

    if (event.altKey) modifiers.add("alt")

    if (event.metaKey) modifiers.add("meta")

    return {
        key: event.key,
        modifiers,
    }
}

/**
 * Returns true if the event was triggered by a standalone modifier key.
 * We use this to ignore events like pressing Ctrl alone — these should
 * never trigger a shortcut binding.
 */
export function isModifierOnly(event: KeyboardEvent): boolean {
    const modifierKeys = new Set([
        "Control",
        "Shift",
        "Alt",
        "Meta",
        "AltGraph",
        "CapsLock",
        "NumLock",
        "ScrollLock",
        "Hyper",
        "Super",
        "Symbol",
        "SymbolLock",
        "Fn",
        "FnLock",
    ])

    return modifierKeys.has(event.key)
}
