import { matchesEvent, parseShortcut } from "./parser"
import { Binding, HandlerFn, ShortcutOptions } from "./types"

let IDCounter = 0

function generateID(): string {
    return `keystrok_${++IDCounter}`
}

const isDev = typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : true

export class Registry {
    private bindings: Map<string, Binding> = new Map()

    add(shortcut: string | string[], handler: HandlerFn, options: ShortcutOptions = {}): string {
        const resolvedOptions: Required<ShortcutOptions> = {
            scope: options.scope ?? "global",
            event: options.event ?? "keydown",
            preventDefault: options.preventDefault ?? false,
            once: options.once ?? false,
        }

        if (isDev) {
            this.warnIfConflict(shortcut, resolvedOptions.scope)
        }

        const id = generateID()

        this.bindings.set(id, {
            id,
            shortcut,
            handler,
            options: resolvedOptions,
        })

        return id
    }

    remove(shortcut: string | string[]): void {
        for (const [id, binding] of this.bindings) {
            if (this.shortcutMatches(binding.shortcut, shortcut)) {
                this.bindings.delete(id)
            }
        }
    }

    removeByID(id: string): void {
        this.bindings.delete(id)
    }

    removeAll(): void {
        this.bindings.clear()
    }

    getAll(): Binding[] {
        return Array.from(this.bindings.values())
    }

    getByScope(scope: string): Binding[] {
        return this.getAll().filter((binding) => binding.options.scope === scope)
    }

    getByEvent(event: "keydown" | "keyup"): Binding[] {
        return this.getAll().filter((binding) => binding.options.event === event)
    }

    /**
     * Finds all bindings that match a given KeyboardEvent within
     * the provided active scopes.
     */
    findMatches(event: KeyboardEvent, activeScopes: Set<string>): Binding[] {
        const matches: Binding[] = []

        for (const binding of this.bindings.values()) {
            if (!activeScopes.has(binding.options.scope)) continue

            if (binding.options.event !== event.type) continue

            const shortcuts = Array.isArray(binding.shortcut) ? binding.shortcut : [binding.shortcut]

            for (const shortcut of shortcuts) {
                const parsed = parseShortcut(shortcut)

                if (matchesEvent(parsed, event)) {
                    matches.push(binding)

                    break
                }
            }
        }

        return matches
    }

    private shortcutMatches(a: string | string[], b: string | string[]): boolean {
        const normalize = (s: string | string[]) => (Array.isArray(s) ? s.join("+") : s)

        return normalize(a) === normalize(b)
    }

    private warnIfConflict(shortcut: string | string[], scope: string): void {
        for (const binding of this.bindings.values()) {
            if (this.shortcutMatches(binding.shortcut, shortcut) && binding.options.scope === scope) {
                const key = Array.isArray(shortcut) ? shortcut.join(" → ") : shortcut

                console.warn(
                    `[keystrok] ⚠️ Conflict detected: "${key}" is already bound in scope "${scope}". Both handlers will fire.`,
                )

                return
            }
        }
    }
}
