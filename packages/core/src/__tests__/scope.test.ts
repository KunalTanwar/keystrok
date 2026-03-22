import { describe, it, expect, beforeEach, spyOn } from "bun:test"
import { ScopeManager } from "../scope"

describe("ScopeManager", () => {
    let scope: ScopeManager

    beforeEach(() => {
        scope = new ScopeManager()
    })

    describe("initialization", () => {
        it("registers global scope by default", () => {
            const all = scope.getAll()

            expect(all.some((s) => s.name === "global")).toBe(true)
        })

        it("activates global scope by default", () => {
            expect(scope.isActive("global")).toBe(true)
        })
    })

    describe("register", () => {
        it("registers a new scope as inactive", () => {
            scope.register("editor")

            expect(scope.isActive("editor")).toBe(false)
        })

        it("does not overwrite an existing scope", () => {
            scope.register("editor")
            scope.activate("editor")
            scope.register("editor") // should be a no-op

            expect(scope.isActive("editor")).toBe(true)
        })
    })

    describe("activate", () => {
        it("activates a scope", () => {
            scope.activate("editor")

            expect(scope.isActive("editor")).toBe(true)
        })

        it("auto-registers an unknown scope when activated", () => {
            scope.activate("unknown")

            expect(scope.isActive("unknown")).toBe(true)
        })
    })

    describe("deactivate", () => {
        it("deactivates a scope", () => {
            scope.activate("editor")
            scope.deactivate("editor")

            expect(scope.isActive("editor")).toBe(false)
        })

        it("cannot deactivate global scope", () => {
            const warn = spyOn(console, "warn").mockImplementation(() => {})

            scope.deactivate("global")

            expect(scope.isActive("global")).toBe(true)
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('"global"'))

            warn.mockRestore()
        })
    })

    describe("override", () => {
        it("marks a scope as override", () => {
            scope.override("modal")

            const all = scope.getAll()
            const modal = all.find((s) => s.name === "modal")

            expect(modal?.override).toBe(true)
            expect(modal?.active).toBe(true)
        })

        it("clears override flag when deactivated", () => {
            scope.override("modal")
            scope.deactivate("modal")

            const all = scope.getAll()
            const modal = all.find((s) => s.name === "modal")

            expect(modal?.override).toBe(false)
        })
    })

    describe("getActiveScopes", () => {
        it("returns global by default", () => {
            expect(scope.getActiveScopes()).toEqual(new Set(["global"]))
        })

        it("returns all active scopes", () => {
            scope.activate("editor")
            scope.activate("sidebar")

            expect(scope.getActiveScopes()).toEqual(new Set(["global", "editor", "sidebar"]))
        })

        it("returns only override scope + global when override is active", () => {
            scope.activate("editor")
            scope.override("modal")

            expect(scope.getActiveScopes()).toEqual(new Set(["global", "modal"]))
        })

        it("excludes deactivated scopes", () => {
            scope.activate("editor")
            scope.deactivate("editor")

            expect(scope.getActiveScopes()).toEqual(new Set(["global"]))
        })

        it("does not include global twice when global is the override", () => {
            scope.override("global")

            const active = scope.getActiveScopes()
            const globalCount = Array.from(active).filter((s) => s === "global").length

            expect(globalCount).toBe(1)
        })
    })

    describe("isActive", () => {
        it("returns false for unknown scope", () => {
            expect(scope.isActive("nonexistent")).toBe(false)
        })
    })
})
