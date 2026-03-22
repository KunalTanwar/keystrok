import { ScopeState } from "./types"

export class ScopeManager {
    private scopes: Map<string, ScopeState> = new Map()

    constructor() {
        // global scope is always registered and active by default
        this.register("global")
        this.activate("global")
    }

    register(name: string): void {
        if (this.scopes.has(name)) return

        this.scopes.set(name, {
            name,
            active: false,
            override: false,
        })
    }

    activate(name: string): void {
        this.ensureRegistered(name)

        const scope = this.scopes.get(name)!

        scope.active = true
        scope.override = false
    }

    deactivate(name: string): void {
        if (name === "global") {
            console.warn('[keystrok] ⚠️ The "global" scope cannot be deactivated.')

            return
        }

        this.ensureRegistered(name)

        const scope = this.scopes.get(name)!

        scope.active = false
        scope.override = false
    }

    /**
     * Activates a scope and marks it as an override — suppressing all
     * other scopes until it is deactivated. Useful for modals, dialogs,
     * or any context where only one set of shortcuts should be active.
     */
    override(name: string): void {
        this.ensureRegistered(name)

        const scope = this.scopes.get(name)!

        scope.active = true
        scope.override = true
    }

    /**
     * Returns the set of scope names that should be used when matching
     * bindings against a keyboard event.
     *
     * If any scope is in override mode, only that scope (plus global) is returned.
     * Otherwise all active scopes are returned.
     */
    getActiveScopes(): Set<string> {
        const overrides = Array.from(this.scopes.values()).filter((s) => s.active && s.override)

        if (overrides.length > 0) {
            return new Set(["global", ...overrides.map((s) => s.name)])
        }

        return new Set(
            Array.from(this.scopes.values())
                .filter((s) => s.active)
                .map((s) => s.name),
        )
    }

    isActive(name: string): boolean {
        return this.scopes.get(name)?.active ?? false
    }

    getAll(): ScopeState[] {
        return Array.from(this.scopes.values())
    }

    private ensureRegistered(name: string): void {
        if (!this.scopes.has(name)) {
            this.register(name)
        }
    }
}
