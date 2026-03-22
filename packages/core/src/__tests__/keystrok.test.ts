import { describe, it, expect, beforeEach, mock } from "bun:test"
import { Keystrok, createKeystrok } from "../keystrok"

function fireKey(
    key: string,
    type: "keydown" | "keyup" = "keydown",
    modifiers: Partial<Record<"ctrlKey" | "shiftKey" | "altKey" | "metaKey", boolean>> = {},
): void {
    const event = new KeyboardEvent(type, {
        key,
        ctrlKey: modifiers.ctrlKey ?? false,
        shiftKey: modifiers.shiftKey ?? false,
        altKey: modifiers.altKey ?? false,
        metaKey: modifiers.metaKey ?? false,
        bubbles: true,
    })
    window.dispatchEvent(event)
}

describe("Keystrok", () => {
    let ks: Keystrok

    beforeEach(() => {
        ks = createKeystrok()
    })

    describe("bind / unbind", () => {
        it("calls handler when shortcut fires", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it("does not call handler after unbind", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)
            ks.unbind("ctrl+k")

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).not.toHaveBeenCalled()
        })

        it("is chainable", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler).bind("ctrl+p", handler)

            fireKey("k", "keydown", { ctrlKey: true })
            fireKey("p", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(2)
        })

        it("only fires once when once: true", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler, { once: true })

            fireKey("k", "keydown", { ctrlKey: true })
            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it("calls handler on keyup when event: keyup", () => {
            const handler = mock(() => {})
            ks.bind("ctrl+k", handler, { event: "keyup" })

            fireKey("k", "keydown", { ctrlKey: true })
            expect(handler).not.toHaveBeenCalled()

            fireKey("k", "keyup", { ctrlKey: true })
            expect(handler).toHaveBeenCalledTimes(1)
        })

        it("does not fire when extra modifier is held", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)

            fireKey("k", "keydown", { ctrlKey: true, shiftKey: true })

            expect(handler).not.toHaveBeenCalled()
        })
    })

    describe("scope", () => {
        it("does not fire when binding scope is inactive", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler, { scope: "editor" })

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).not.toHaveBeenCalled()
        })

        it("fires when binding scope is activated", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler, { scope: "editor" })
            ks.scope("editor").activate()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it("suppresses non-override scopes when override is active", () => {
            const globalHandler = mock(() => {})
            const modalHandler = mock(() => {})

            ks.bind("ctrl+k", globalHandler, { scope: "global" })
            ks.bind("ctrl+k", modalHandler, { scope: "modal" })
            ks.scope("modal").override()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(modalHandler).toHaveBeenCalledTimes(1)
            expect(globalHandler).toHaveBeenCalledTimes(1) // global always active
        })

        it("returns isActive correctly", () => {
            expect(ks.scope("editor").isActive()).toBe(false)

            ks.scope("editor").activate()

            expect(ks.scope("editor").isActive()).toBe(true)
        })
    })

    describe("sequences", () => {
        it("fires handler on completed sequence", () => {
            const handler = mock(() => {})

            ks.bind(["g", "b"], handler)

            fireKey("g")
            fireKey("b")

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it("does not fire on incomplete sequence", () => {
            const handler = mock(() => {})

            ks.bind(["g", "b"], handler)

            fireKey("g")
            expect(handler).not.toHaveBeenCalled()
        })

        it("does not fire on wrong sequence", () => {
            const handler = mock(() => {})

            ks.bind(["g", "b"], handler)

            fireKey("g")
            fireKey("x")

            expect(handler).not.toHaveBeenCalled()
        })
    })

    describe("destroy / stop / start", () => {
        it("stops handling events after destroy", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)
            ks.destroy()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).not.toHaveBeenCalled()
        })

        it("stops handling events after stop", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)
            ks.stop()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).not.toHaveBeenCalled()
        })

        it("resumes handling events after start", () => {
            const handler = mock(() => {})

            ks.bind("ctrl+k", handler)
            ks.stop()
            ks.start()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(1)
        })
    })

    describe("createKeystrok", () => {
        it("creates isolated instances", () => {
            const ks1 = createKeystrok()
            const ks2 = createKeystrok()
            const handler = mock(() => {})

            ks1.bind("ctrl+k", handler)
            ks2.destroy()

            fireKey("k", "keydown", { ctrlKey: true })

            expect(handler).toHaveBeenCalledTimes(1)

            ks1.destroy()
        })
    })
})
