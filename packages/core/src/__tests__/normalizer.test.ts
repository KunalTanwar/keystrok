import { describe, it, expect } from "bun:test"
import { normalizeEvent, isModifierOnly } from "../normalizer"

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

describe("normalizeEvent", () => {
    describe("key", () => {
        it("preserves the key as-is", () => {
            const result = normalizeEvent(makeEvent("k"))

            expect(result.key).toBe("k")
        })

        it("preserves named keys as-is", () => {
            expect(normalizeEvent(makeEvent("Enter")).key).toBe("Enter")
            expect(normalizeEvent(makeEvent("Escape")).key).toBe("Escape")
            expect(normalizeEvent(makeEvent("ArrowUp")).key).toBe("ArrowUp")
        })

        it("preserves uppercase keys as-is", () => {
            const result = normalizeEvent(makeEvent("A"))

            expect(result.key).toBe("A")
        })
    })

    describe("modifiers", () => {
        it("returns empty modifiers when none are held", () => {
            const result = normalizeEvent(makeEvent("k"))

            expect(result.modifiers.size).toBe(0)
        })

        it("captures ctrl", () => {
            const result = normalizeEvent(makeEvent("k", { ctrlKey: true }))

            expect(result.modifiers).toEqual(new Set(["ctrl"]))
        })

        it("captures shift", () => {
            const result = normalizeEvent(makeEvent("k", { shiftKey: true }))

            expect(result.modifiers).toEqual(new Set(["shift"]))
        })

        it("captures alt", () => {
            const result = normalizeEvent(makeEvent("k", { altKey: true }))

            expect(result.modifiers).toEqual(new Set(["alt"]))
        })

        it("captures meta", () => {
            const result = normalizeEvent(makeEvent("k", { metaKey: true }))

            expect(result.modifiers).toEqual(new Set(["meta"]))
        })

        it("captures multiple modifiers", () => {
            const result = normalizeEvent(makeEvent("k", { ctrlKey: true, shiftKey: true }))

            expect(result.modifiers).toEqual(new Set(["ctrl", "shift"]))
        })

        it("captures all four modifiers", () => {
            const result = normalizeEvent(
                makeEvent("k", { ctrlKey: true, shiftKey: true, altKey: true, metaKey: true }),
            )

            expect(result.modifiers).toEqual(new Set(["ctrl", "shift", "alt", "meta"]))
        })
    })
})

describe("isModifierOnly", () => {
    it("returns true for Control", () => {
        expect(isModifierOnly(makeEvent("Control"))).toBe(true)
    })

    it("returns true for Shift", () => {
        expect(isModifierOnly(makeEvent("Shift"))).toBe(true)
    })

    it("returns true for Alt", () => {
        expect(isModifierOnly(makeEvent("Alt"))).toBe(true)
    })

    it("returns true for Meta", () => {
        expect(isModifierOnly(makeEvent("Meta"))).toBe(true)
    })

    it("returns true for AltGraph", () => {
        expect(isModifierOnly(makeEvent("AltGraph"))).toBe(true)
    })

    it("returns true for CapsLock", () => {
        expect(isModifierOnly(makeEvent("CapsLock"))).toBe(true)
    })

    it("returns false for a regular key", () => {
        expect(isModifierOnly(makeEvent("k"))).toBe(false)
    })

    it("returns false for Enter", () => {
        expect(isModifierOnly(makeEvent("Enter"))).toBe(false)
    })

    it("returns false for a regular key even when modifiers are held", () => {
        expect(isModifierOnly(makeEvent("k", { ctrlKey: true }))).toBe(false)
    })
})
