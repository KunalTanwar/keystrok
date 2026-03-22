import { isModifierOnly } from "./normalizer"
import { Registry } from "./registry"
import { ScopeManager } from "./scope"
import { SequenceMatcher } from "./sequence"
import { HandlerFn, ShortcutOptions } from "./types"

export class Keystrok {
    private registry: Registry
    private scopeManager: ScopeManager
    private sequenceMatcher: SequenceMatcher
    private listening: boolean = false

    private boundOnKeydown: (e: KeyboardEvent) => void
    private boundOnKeyup: (e: KeyboardEvent) => void

    constructor() {
        this.registry = new Registry()
        this.scopeManager = new ScopeManager()
        this.sequenceMatcher = new SequenceMatcher()

        this.boundOnKeydown = this.handleEvent.bind(this, "keydown")
        this.boundOnKeyup = this.handleEvent.bind(this, "keyup")

        this.start()
    }

    /**
     * Bind a shortcut to a handler.
     *
     * @param shortcut - A shortcut string ("ctrl+k") or a sequence (["g", "b"])
     * @param handler  - The function to call when the shortcut fires
     * @param options  - Optional scope, event type, preventDefault, once
     *
     * @example
     * keystrok.bind('ctrl+k', () => openSearch())
     * keystrok.bind(['g', 'b'], () => goBack())
     * keystrok.bind('ctrl+s', save, { preventDefault: true })
     */
    bind(shortcut: string | string[], handler: HandlerFn, options: ShortcutOptions = {}): this {
        this.registry.add(shortcut, handler, options)

        return this
    }

    /**
     * Unbind a shortcut.
     *
     * @example
     * keystrok.unbind('ctrl+k')
     */
    unbind(shortcut: string | string[]): this {
        this.registry.remove(shortcut)

        return this
    }

    /**
     * Manage scopes.
     *
     * @example
     * keystrok.scope('editor').activate()
     * keystrok.scope('modal').override()
     * keystrok.scope('editor').deactivate()
     */

    scope(name: string): {
        activate: () => Keystrok
        deactivate: () => Keystrok
        override: () => Keystrok
        isActive: () => boolean
    } {
        return {
            activate: () => {
                this.scopeManager.activate(name)

                return this
            },
            deactivate: () => {
                this.scopeManager.deactivate(name)

                return this
            },
            override: () => {
                this.scopeManager.override(name)

                return this
            },
            isActive: () => this.scopeManager.isActive(name),
        }
    }

    /**
     * Remove all bindings and stop listening to keyboard events.
     */
    destroy(): void {
        this.stop()
        this.registry.removeAll()
    }

    /**
     * Start listening to keyboard events.
     * Called automatically on construction.
     */
    start(): void {
        if (this.listening) return
        if (typeof window === "undefined") return

        window.addEventListener("keydown", this.boundOnKeydown)
        window.addEventListener("keyup", this.boundOnKeyup)

        this.listening = true
    }

    /**
     * Stop listening to keyboard events without removing bindings.
     */
    stop(): void {
        if (!this.listening) return
        if (typeof window === "undefined") return

        window.removeEventListener("keydown", this.boundOnKeydown)
        window.removeEventListener("keyup", this.boundOnKeyup)

        this.listening = false
    }

    private handleEvent(type: "keydown" | "keyup", event: KeyboardEvent): void {
        if (isModifierOnly(event)) return

        const activeScopes = this.scopeManager.getActiveScopes()

        // handle sequence shortcuts
        const allBindings = this.registry.getAll()
        const sequences = allBindings
            .filter((binding) => Array.isArray(binding.shortcut))
            .map((binding) => binding.shortcut as string[])

        if (type === "keydown" && sequences.length > 0) {
            const matchedSequence = this.sequenceMatcher.push(event, sequences)

            if (matchedSequence) {
                const seqBindings = allBindings.filter(
                    (binding) =>
                        Array.isArray(binding.shortcut) &&
                        binding.shortcut.join("+") === matchedSequence.join("+") &&
                        activeScopes.has(binding.options.scope),
                )

                for (const binding of seqBindings) {
                    if (binding.options.preventDefault) event.preventDefault()

                    binding.handler(event)

                    if (binding.options.once) this.registry.removeByID(binding.id)
                }

                if (seqBindings.length > 0) return
            }
        }

        // handle regular shortcuts
        const matches = this.registry.findMatches(event, activeScopes)

        for (const binding of matches) {
            if (Array.isArray(binding.shortcut)) continue // already handled above

            if (binding.options.preventDefault) event.preventDefault()

            binding.handler(event)

            if (binding.options.once) this.registry.removeByID(binding.id)
        }
    }
}

/**
 * Creates a new isolated Keystrok instance.
 * Useful for testing or when you need multiple independent instances.
 */
export function createKeystrok(): Keystrok {
    return new Keystrok()
}

/**
 * The default singleton instance.
 * Import and use this directly in most cases.
 */
export const keystrok = createKeystrok()
