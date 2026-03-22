import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test"
import { Registry } from "../registry"

function makeEvent(
    key: string,
    type: "keydown" | "keyup" = "keydown",
    modifiers: Partial<Record<"ctrlKey" | "shiftKey" | "altKey" | "metaKey", boolean>> = {},
): KeyboardEvent {
    return {
        key,
        type,
        ctrlKey: modifiers.ctrlKey ?? false,
        shiftKey: modifiers.shiftKey ?? false,
        altKey: modifiers.altKey ?? false,
        metaKey: modifiers.metaKey ?? false,
    } as KeyboardEvent
}

const noop = () => {}

describe("Registry", () => {
    let registry: Registry

    beforeEach(() => {
        registry = new Registry()
    })

    describe("add", () => {
        it("adds a binding and returns an id", () => {
            const id = registry.add("ctrl+k", noop)

            expect(typeof id).toBe("string")
            expect(id.startsWith("keystrok_")).toBe(true)
        })

        it("applies default options", () => {
            registry.add("ctrl+k", noop)

            const bindings = registry.getAll()

            expect(bindings[0]?.options).toEqual({
                scope: "global",
                event: "keydown",
                preventDefault: false,
                once: false,
            })
        })

        it("respects provided options", () => {
            registry.add("ctrl+k", noop, {
                scope: "editor",
                event: "keyup",
                preventDefault: true,
                once: true,
            })

            const bindings = registry.getAll()

            expect(bindings[0]?.options).toEqual({
                scope: "editor",
                event: "keyup",
                preventDefault: true,
                once: true,
            })
        })

        it("adds multiple bindings", () => {
            registry.add("ctrl+k", noop)
            registry.add("ctrl+p", noop)

            expect(registry.getAll().length).toBe(2)
        })

        it("warns on conflict in dev", () => {
            const warn = spyOn(console, "warn").mockImplementation(() => {})

            registry.add("ctrl+k", noop)
            registry.add("ctrl+k", noop)

            expect(warn).toHaveBeenCalledWith(expect.stringContaining("Conflict detected"))

            warn.mockRestore()
        })

        it("does not warn when same shortcut is in different scopes", () => {
            const warn = spyOn(console, "warn").mockImplementation(() => {})

            registry.add("ctrl+k", noop, { scope: "global" })
            registry.add("ctrl+k", noop, { scope: "editor" })

            expect(warn).not.toHaveBeenCalled()

            warn.mockRestore()
        })
    })

    describe("remove", () => {
        it("removes a binding by shortcut", () => {
            registry.add("ctrl+k", noop)
            registry.remove("ctrl+k")

            expect(registry.getAll().length).toBe(0)
        })

        it("removes all bindings matching the shortcut", () => {
            registry.add("ctrl+k", noop)
            registry.add("ctrl+k", noop)
            registry.remove("ctrl+k")

            expect(registry.getAll().length).toBe(0)
        })

        it("does not remove other bindings", () => {
            registry.add("ctrl+k", noop)
            registry.add("ctrl+p", noop)
            registry.remove("ctrl+k")

            expect(registry.getAll().length).toBe(1)
            expect(registry.getAll()[0]?.shortcut).toBe("ctrl+p")
        })
    })

    describe("removeById", () => {
        it("removes a binding by id", () => {
            const id = registry.add("ctrl+k", noop)

            registry.removeByID(id)

            expect(registry.getAll().length).toBe(0)
        })

        it("does not remove other bindings", () => {
            const id = registry.add("ctrl+k", noop)

            registry.add("ctrl+p", noop)
            registry.removeByID(id)

            expect(registry.getAll().length).toBe(1)
        })
    })

    describe("removeAll", () => {
        it("clears all bindings", () => {
            registry.add("ctrl+k", noop)
            registry.add("ctrl+p", noop)
            registry.removeAll()

            expect(registry.getAll().length).toBe(0)
        })
    })

    describe("getByScope", () => {
        it("returns bindings in the given scope", () => {
            registry.add("ctrl+k", noop, { scope: "global" })
            registry.add("ctrl+p", noop, { scope: "editor" })

            const result = registry.getByScope("editor")

            expect(result.length).toBe(1)
            expect(result[0]?.shortcut).toBe("ctrl+p")
        })

        it("returns empty array if scope has no bindings", () => {
            registry.add("ctrl+k", noop, { scope: "global" })

            expect(registry.getByScope("modal").length).toBe(0)
        })
    })

    describe("getByEvent", () => {
        it("returns bindings for keydown", () => {
            registry.add("ctrl+k", noop, { event: "keydown" })
            registry.add("ctrl+p", noop, { event: "keyup" })

            expect(registry.getByEvent("keydown").length).toBe(1)
        })

        it("returns bindings for keyup", () => {
            registry.add("ctrl+k", noop, { event: "keyup" })

            expect(registry.getByEvent("keyup").length).toBe(1)
        })
    })

    describe("findMatches", () => {
        const globalScopes = new Set(["global"])

        it("finds a matching binding", () => {
            const handler = () => {}

            registry.add("ctrl+k", handler)

            const matches = registry.findMatches(makeEvent("k", "keydown", { ctrlKey: true }), globalScopes)

            expect(matches.length).toBe(1)
            expect(matches[0]?.handler).toBe(handler)
        })

        it("returns empty when no match", () => {
            registry.add("ctrl+k", noop)

            const matches = registry.findMatches(makeEvent("p", "keydown", { ctrlKey: true }), globalScopes)

            expect(matches.length).toBe(0)
        })

        it("does not match bindings outside active scopes", () => {
            registry.add("ctrl+k", noop, { scope: "editor" })

            const matches = registry.findMatches(makeEvent("k", "keydown", { ctrlKey: true }), globalScopes)

            expect(matches.length).toBe(0)
        })

        it("does not match wrong event type", () => {
            registry.add("ctrl+k", noop, { event: "keyup" })

            const matches = registry.findMatches(makeEvent("k", "keydown", { ctrlKey: true }), globalScopes)

            expect(matches.length).toBe(0)
        })

        it("matches multiple handlers for same shortcut", () => {
            registry.add("ctrl+k", noop)
            registry.add("ctrl+k", noop)

            const matches = registry.findMatches(makeEvent("k", "keydown", { ctrlKey: true }), globalScopes)

            expect(matches.length).toBe(2)
        })

        it("matches across multiple active scopes", () => {
            registry.add("ctrl+k", noop, { scope: "global" })
            registry.add("ctrl+k", noop, { scope: "editor" })

            const matches = registry.findMatches(
                makeEvent("k", "keydown", { ctrlKey: true }),

                new Set(["global", "editor"]),
            )

            expect(matches.length).toBe(2)
        })
    })
})
