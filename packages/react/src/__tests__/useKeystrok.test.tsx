/// <reference lib="dom" />

import { describe, it, expect, beforeEach } from "bun:test"
import { render, act } from "@testing-library/react"
import { createElement } from "react"
import { createKeystrok } from "keystrok"
import { useKeystrok } from "../useKeystrok"

function fireKey(
    key: string,
    type: "keydown" | "keyup" = "keydown",
    modifiers: Partial<Record<"ctrlKey" | "shiftKey" | "altKey" | "metaKey", boolean>> = {},
): void {
    window.dispatchEvent(
        new KeyboardEvent(type, {
            key,
            bubbles: true,
            ctrlKey: modifiers.ctrlKey ?? false,
            shiftKey: modifiers.shiftKey ?? false,
            altKey: modifiers.altKey ?? false,
            metaKey: modifiers.metaKey ?? false,
        }),
    )
}

describe("useKeystrok", () => {
    let instance: ReturnType<typeof createKeystrok>

    beforeEach(() => {
        instance = createKeystrok()
    })

    it("calls handler when shortcut fires", () => {
        let called = false

        function TestComponent() {
            useKeystrok(
                "ctrl+k",
                () => {
                    called = true
                },
                {},
                instance,
            )
            return null
        }

        render(createElement(TestComponent))

        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(called).toBe(true)
    })

    it("unbinds on unmount", () => {
        let count = 0

        function TestComponent() {
            useKeystrok(
                "ctrl+k",
                () => {
                    count++
                },
                {},
                instance,
            )
            return null
        }

        const { unmount } = render(createElement(TestComponent))

        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(count).toBe(1)

        unmount()

        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(count).toBe(1)
    })

    it("always calls the latest handler without rebinding", () => {
        let captured = ""

        function TestComponent({ val }: { val: string }) {
            useKeystrok(
                "ctrl+k",
                () => {
                    captured = val
                },
                {},
                instance,
            )
            return null
        }

        const { rerender } = render(createElement(TestComponent, { val: "initial" }))

        rerender(createElement(TestComponent, { val: "updated" }))

        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(captured).toBe("updated")
    })

    it("does not fire when scope is inactive", () => {
        let called = false

        function TestComponent() {
            useKeystrok(
                "ctrl+k",
                () => {
                    called = true
                },
                { scope: "editor" },
                instance,
            )
            return null
        }

        render(createElement(TestComponent))

        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(called).toBe(false)
    })

    it("fires when scope is activated", () => {
        let called = false

        function TestComponent() {
            useKeystrok(
                "ctrl+k",
                () => {
                    called = true
                },
                { scope: "editor" },
                instance,
            )
            return null
        }

        render(createElement(TestComponent))

        act(() => instance.scope("editor").activate())
        act(() => fireKey("k", "keydown", { ctrlKey: true }))

        expect(called).toBe(true)
    })

    it("binds sequence shortcuts", () => {
        let called = false

        function TestComponent() {
            useKeystrok(
                ["g", "b"],
                () => {
                    called = true
                },
                {},
                instance,
            )
            return null
        }

        render(createElement(TestComponent))

        act(() => fireKey("g"))
        act(() => fireKey("b"))

        expect(called).toBe(true)
    })
})
