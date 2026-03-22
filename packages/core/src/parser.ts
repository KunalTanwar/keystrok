import { Modifier, ParsedKey } from "./types"

const MODIFIER_ALIASES: Record<string, Modifier> = {
    ctrl: "ctrl",
    control: "ctrl",
    shift: "shift",
    alt: "alt",
    option: "alt",
    meta: "meta",
    cmd: "meta",
    command: "meta",
    win: "meta",
}

const MODIFIERS = new Set<Modifier>(["ctrl", "shift", "alt", "meta"])

/**
 * Parses a single shortcut string into a ParsedKey.
 *
 * Examples:
 *   "ctrl+k"       → { key: "k",   modifiers: Set { "ctrl" } }
 *   "ctrl+shift+p" → { key: "p",   modifiers: Set { "ctrl", "shift" } }
 *   "cmd+z"        → { key: "z",   modifiers: Set { "meta" } }
 *   "a"            → { key: "a",   modifiers: Set {} }
 *   "space"        → { key: " ",   modifiers: Set {} }
 *   "enter"        → { key: "Enter", modifiers: Set {} }
 */
export function parseShortcut(shortcut: string): ParsedKey {
    const parts = shortcut
        .trim()
        .toLowerCase()
        .split("+")
        .map((part) => part.trim())
        .filter(Boolean)

    if (parts.length === 0) {
        throw new Error(`[keystrok] Invalid shortcut: ${shortcut}.`)
    }

    const modifiers = new Set<Modifier>()
    const keys: string[] = []

    for (const part of parts) {
        const alias = MODIFIER_ALIASES[part]

        if (alias !== undefined) {
            modifiers.add(alias)
        } else {
            keys.push(part)
        }
    }

    if (keys.length === 0) {
        throw new Error(`[keystrok] Shortcut ${shortcut} has no non-modifier key.`)
    }

    if (keys.length > 1) {
        throw new Error(
            `[keystrok] Shortcut "${shortcut} has multiple non-modifier keys: ${keys.join("")}. Did you mean a sequence? Pass an array instead: ["${keys.join('", "')}"]`,
        )
    }

    const rawKey = keys[0] as string

    return {
        key: normalizeKey(rawKey),
        modifiers,
    }
}

/**
 * Normalizes key aliases to their KeyboardEvent.key equivalents.
 * We use KeyboardEvent.key — NOT keyCode or which — for correct
 * behavior on international and non-standard keyboard layouts.
 */

function normalizeKey(key: string): string {
    const KEY_ALIASES: Record<string, string> = {
        space: " ",
        enter: "Enter",
        return: "Enter",
        esc: "Escape",
        escape: "Escape",
        tab: "Tab",
        backspace: "Backspace",
        delete: "Delete",
        del: "Delete",
        insert: "Insert",
        ins: "Insert",
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        home: "Home",
        end: "End",
        pageup: "PageUp",
        pagedown: "PageDown",
        capslock: "CapsLock",
    }

    return KEY_ALIASES[key] ?? key
}

/**
 * Checks if a KeyboardEvent matches a ParsedKey.
 * Uses KeyboardEvent.key for correct international layout support.
 */
export function matchesEvent(parsed: ParsedKey, event: KeyboardEvent): boolean {
    const eventKey = event.key

    const keyMatches =
        parsed.key.length === 1 ? eventKey.toLowerCase() === parsed.key.toLowerCase() : eventKey === parsed.key

    const isShiftedChar = parsed.key.length === 1 && parsed.modifiers.size === 0 && !/^[a-zA-Z0-9]$/.test(parsed.key)

    const modifiersMatch =
        parsed.modifiers.has("ctrl") === event.ctrlKey &&
        (isShiftedChar ? true : parsed.modifiers.has("shift") === event.shiftKey) &&
        parsed.modifiers.has("alt") === event.altKey &&
        parsed.modifiers.has("meta") === event.metaKey

    return keyMatches && modifiersMatch
}
