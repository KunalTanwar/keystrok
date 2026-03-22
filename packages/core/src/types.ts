export type Modifier = "ctrl" | "shift" | "alt" | "meta" | "cmd"

export type KeyEvent = "keydown" | "keyup"

export type HandlerFn = (event: KeyboardEvent) => void

export interface ShortcutOptions {
    // Scope this binding belongs to. Defaults to "global".
    scope?: string
    // Which keyboard event to listen on. Defaults to "keydown".
    event?: KeyEvent
    // Whether to call event.preventDefault(). Defaults to false.
    preventDefault?: boolean
    // Unbind automatically after firing once. Defaults to false.
    once?: boolean
}

export interface Binding {
    id: string
    // Raw shortcut string(s) as provided by the user e.g. "ctrl + k" or ["g", "b"]
    shortcut: string | string[]
    handler: HandlerFn
    options: Required<ShortcutOptions>
}

export interface ParsedKey {
    key: string
    modifiers: Set<Modifier>
}

export interface ScopeState {
    name: string
    active: boolean
    // If true, suppresses all lower-priority scopes
    override: boolean
}
