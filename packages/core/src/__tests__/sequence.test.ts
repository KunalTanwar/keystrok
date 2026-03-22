import { describe, it, expect, beforeEach, mock } from "bun:test"
import { SequenceMatcher } from "../sequence"

function makeEvent(key: string): KeyboardEvent {
    return { key, type: "keydown" } as KeyboardEvent
}

describe("SequenceMatcher", () => {
    let matcher: SequenceMatcher
    const sequences = [
        ["g", "b"],
        ["g", "h"],
        ["a", "b", "c"],
    ]

    beforeEach(() => {
        matcher = new SequenceMatcher()
    })

    describe("push", () => {
        it("returns null when sequence is incomplete", () => {
            const result = matcher.push(makeEvent("g"), sequences)

            expect(result).toBeNull()
        })

        it("returns matched sequence when completed", () => {
            matcher.push(makeEvent("g"), sequences)

            const result = matcher.push(makeEvent("b"), sequences)

            expect(result).toEqual(["g", "b"])
        })

        it("matches case-insensitively", () => {
            matcher.push(makeEvent("G"), sequences)

            const result = matcher.push(makeEvent("B"), sequences)

            expect(result).toEqual(["g", "b"])
        })

        it("returns null for non-registered keys", () => {
            const result = matcher.push(makeEvent("x"), sequences)

            expect(result).toBeNull()
        })

        it("resets buffer after a match", () => {
            matcher.push(makeEvent("g"), sequences)
            matcher.push(makeEvent("b"), sequences)

            expect(matcher.getBuffer()).toEqual([])
        })

        it("resets buffer when no partial match exists", () => {
            matcher.push(makeEvent("x"), sequences)

            expect(matcher.getBuffer()).toEqual([])
        })

        it("handles 3-key sequences", () => {
            matcher.push(makeEvent("a"), sequences)
            matcher.push(makeEvent("b"), sequences)

            const result = matcher.push(makeEvent("c"), sequences)

            expect(result).toEqual(["a", "b", "c"])
        })

        it("differentiates between sequences with same prefix", () => {
            matcher.push(makeEvent("g"), sequences)

            const result = matcher.push(makeEvent("h"), sequences)

            expect(result).toEqual(["g", "h"])
        })

        it("keeps buffering when prefix matches multiple sequences", () => {
            matcher.push(makeEvent("g"), sequences)

            expect(matcher.getBuffer()).toEqual(["g"])
        })
    })

    describe("reset", () => {
        it("clears the buffer", () => {
            matcher.push(makeEvent("g"), sequences)
            matcher.reset()

            expect(matcher.getBuffer()).toEqual([])
        })

        it("calls onReset callback", () => {
            const onReset = mock(() => {})

            matcher.setOnReset(onReset)
            matcher.reset()

            expect(onReset).toHaveBeenCalledTimes(1)
        })
    })

    describe("getBuffer", () => {
        it("returns a copy of the buffer", () => {
            matcher.push(makeEvent("g"), sequences)

            const buf = matcher.getBuffer()

            buf.push("mutated")

            expect(matcher.getBuffer()).toEqual(["g"])
        })
    })

    describe("setOnReset", () => {
        it("calls onReset when buffer resets after no partial match", () => {
            const onReset = mock(() => {})

            matcher.setOnReset(onReset)
            matcher.push(makeEvent("x"), sequences)

            expect(onReset).toHaveBeenCalledTimes(1)
        })

        it("calls onReset after a completed match", () => {
            const onReset = mock(() => {})

            matcher.setOnReset(onReset)
            matcher.push(makeEvent("g"), sequences)
            matcher.push(makeEvent("b"), sequences)

            expect(onReset).toHaveBeenCalledTimes(1)
        })
    })
})
