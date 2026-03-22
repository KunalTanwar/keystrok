import { describe, it, expect } from "bun:test"
import { parseShortcut, matchesEvent } from "../parser"

describe("parseShortcut", () => {
    describe("basic keys", () => {
        it("parses a single key", () => {
            const result = parseShortcut("a")

            expect(result.key).toBe("a")
            expect(result.modifiers.size).toBe(0)
        })

        it("parses an uppercase key as lowercase", () => {
            const result = parseShortcut("A")

            expect(result.key).toBe("a")
        })

        it("parses a number key", () => {
            const result = parseShortcut("1")

            expect(result.key).toBe("1")
        })
    })

    describe("modifiers", () => {
        it("parses ctrl+k", () => {
            const result = parseShortcut("ctrl+k")

            expect(result.key).toBe("k")
            expect(result.modifiers).toEqual(new Set(["ctrl"]))
        })

        it("parses shift+k", () => {
            const result = parseShortcut("shift+k")

            expect(result.key).toBe("k")
            expect(result.modifiers).toEqual(new Set(["shift"]))
        })

        it("parses alt+k", () => {
            const result = parseShortcut("alt+k")

            expect(result.key).toBe("k")
            expect(result.modifiers).toEqual(new Set(["alt"]))
        })

        it("parses meta+k", () => {
            const result = parseShortcut("meta+k")

            expect(result.key).toBe("k")
            expect(result.modifiers).toEqual(new Set(["meta"]))
        })

        it("parses multiple modifiers", () => {
            const result = parseShortcut("ctrl+shift+p")

            expect(result.key).toBe("p")
            expect(result.modifiers).toEqual(new Set(["ctrl", "shift"]))
        })

        it("parses all four modifiers", () => {
            const result = parseShortcut("ctrl+shift+alt+meta+k")

            expect(result.key).toBe("k")
            expect(result.modifiers).toEqual(new Set(["ctrl", "shift", "alt", "meta"]))
        })
    })

    describe("modifier aliases", () => {
        it("normalizes cmd → meta", () => {
            expect(parseShortcut("cmd+k").modifiers).toEqual(new Set(["meta"]))
        })

        it("normalizes command → meta", () => {
            expect(parseShortcut("command+k").modifiers).toEqual(new Set(["meta"]))
        })

        it("normalizes win → meta", () => {
            expect(parseShortcut("win+k").modifiers).toEqual(new Set(["meta"]))
        })

        it("normalizes option → alt", () => {
            expect(parseShortcut("option+k").modifiers).toEqual(new Set(["alt"]))
        })

        it("normalizes control → ctrl", () => {
            expect(parseShortcut("control+k").modifiers).toEqual(new Set(["ctrl"]))
        })
    })

    describe("key aliases", () => {
        it("normalizes space", () => {
            expect(parseShortcut("space").key).toBe(" ")
        })

        it("normalizes enter", () => {
            expect(parseShortcut("enter").key).toBe("Enter")
        })

        it("normalizes return → Enter", () => {
            expect(parseShortcut("return").key).toBe("Enter")
        })

        it("normalizes esc → Escape", () => {
            expect(parseShortcut("esc").key).toBe("Escape")
        })

        it("normalizes del → Delete", () => {
            expect(parseShortcut("del").key).toBe("Delete")
        })

        it("normalizes up → ArrowUp", () => {
            expect(parseShortcut("up").key).toBe("ArrowUp")
        })

        it("normalizes down → ArrowDown", () => {
            expect(parseShortcut("down").key).toBe("ArrowDown")
        })

        it("normalizes left → ArrowLeft", () => {
            expect(parseShortcut("left").key).toBe("ArrowLeft")
        })

        it("normalizes right → ArrowRight", () => {
            expect(parseShortcut("right").key).toBe("ArrowRight")
        })
    })

    describe("whitespace handling", () => {
        it("trims surrounding whitespace", () => {
            expect(parseShortcut("  ctrl+k  ").key).toBe("k")
        })

        it("trims whitespace around parts", () => {
            expect(parseShortcut("ctrl + k").key).toBe("k")
        })
    })

    describe("errors", () => {
        it("throws on empty string", () => {
            expect(() => parseShortcut("")).toThrow("[keystrok]")
        })

        it("throws on modifier-only shortcut", () => {
            expect(() => parseShortcut("ctrl")).toThrow("[keystrok]")
        })

        it("throws on multiple non-modifier keys and hints at sequence", () => {
            expect(() => parseShortcut("g+b")).toThrow("sequence")
        })
    })
})

describe("matchesEvent", () => {
    function makeEvent(
        key: string,
        modifiers: Partial<Record<"ctrlKey" | "shiftKey" | "altKey" | "metaKey", boolean>> = {},
    ): KeyboardEvent {
        return {
            key,
            ctrlKey: modifiers.ctrlKey ?? false,
            shiftKey: modifiers.shiftKey ?? false,
            altKey: modifiers.altKey ?? false,
            metaKey: modifiers.metaKey ?? false,
        } as KeyboardEvent
    }

    it("matches a simple key", () => {
        const parsed = parseShortcut("a")

        expect(matchesEvent(parsed, makeEvent("a"))).toBe(true)
    })

    it("matches case-insensitively for single char keys", () => {
        const parsed = parseShortcut("a")

        expect(matchesEvent(parsed, makeEvent("A"))).toBe(true)
    })

    it("matches ctrl+k", () => {
        const parsed = parseShortcut("ctrl+k")

        expect(matchesEvent(parsed, makeEvent("k", { ctrlKey: true }))).toBe(true)
    })

    it("does not match ctrl+k when shift is also held", () => {
        const parsed = parseShortcut("ctrl+k")

        expect(matchesEvent(parsed, makeEvent("k", { ctrlKey: true, shiftKey: true }))).toBe(false)
    })

    it("does not match when modifier is missing", () => {
        const parsed = parseShortcut("ctrl+k")

        expect(matchesEvent(parsed, makeEvent("k"))).toBe(false)
    })

    it("matches Enter key", () => {
        const parsed = parseShortcut("enter")

        expect(matchesEvent(parsed, makeEvent("Enter"))).toBe(true)
    })

    it("matches Escape key", () => {
        const parsed = parseShortcut("esc")

        expect(matchesEvent(parsed, makeEvent("Escape"))).toBe(true)
    })

    it("matches cmd+z as meta+z", () => {
        const parsed = parseShortcut("cmd+z")

        expect(matchesEvent(parsed, makeEvent("z", { metaKey: true }))).toBe(true)
    })

    it("matches shifted characters like ? without explicit shift modifier", () => {
        const parsed = parseShortcut("?")

        expect(matchesEvent(parsed, makeEvent("?", { shiftKey: true }))).toBe(true)
    })

    it("matches ! without explicit shift modifier", () => {
        const parsed = parseShortcut("!")

        expect(matchesEvent(parsed, makeEvent("!", { shiftKey: true }))).toBe(true)
    })
})
