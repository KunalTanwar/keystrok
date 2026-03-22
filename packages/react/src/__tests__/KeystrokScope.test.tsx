/// <reference lib="dom" />

import { describe, it, expect, beforeEach } from "bun:test"
import { render, act } from "@testing-library/react"
import { createElement } from "react"
import { createKeystrok } from "keystrok"
import { KeystrokScope } from "../KeystrokScope"

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

describe("KeystrokScope", () => {
    let instance: ReturnType<typeof createKeystrok>

    beforeEach(() => {
        instance = createKeystrok()
    })

    describe("activation", () => {
        it("activates scope on mount", () => {
            function TestComponent() {
                return createElement(KeystrokScope, { name: "editor", instance }, createElement("div", null, "content"))
            }

            render(createElement(TestComponent))
            expect(instance.scope("editor").isActive()).toBe(true)
        })

        it("deactivates scope on unmount", () => {
            function TestComponent() {
                return createElement(KeystrokScope, { name: "editor", instance }, createElement("div", null, "content"))
            }

            const { unmount } = render(createElement(TestComponent))
            expect(instance.scope("editor").isActive()).toBe(true)
            unmount()
            expect(instance.scope("editor").isActive()).toBe(false)
        })

        it("activates multiple independent scopes", () => {
            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "editor", instance },
                    createElement(KeystrokScope, { name: "sidebar", instance }, createElement("div", null, "content")),
                )
            }

            render(createElement(TestComponent))
            expect(instance.scope("editor").isActive()).toBe(true)
            expect(instance.scope("sidebar").isActive()).toBe(true)
        })

        it("only deactivates its own scope on unmount, not sibling scopes", () => {
            function Inner() {
                return createElement(
                    KeystrokScope,
                    { name: "sidebar", instance },
                    createElement("div", null, "sidebar"),
                )
            }

            function TestComponent({ showSidebar }: { showSidebar: boolean }) {
                return createElement(
                    KeystrokScope,
                    { name: "editor", instance },
                    showSidebar ? createElement(Inner) : null,
                )
            }

            const { rerender } = render(createElement(TestComponent, { showSidebar: true }))
            expect(instance.scope("editor").isActive()).toBe(true)
            expect(instance.scope("sidebar").isActive()).toBe(true)

            rerender(createElement(TestComponent, { showSidebar: false }))
            expect(instance.scope("editor").isActive()).toBe(true)
            expect(instance.scope("sidebar").isActive()).toBe(false)
        })
    })

    describe("override", () => {
        it("activates scope in override mode when override prop is true", () => {
            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "modal", override: true, instance },
                    createElement("div", null, "modal"),
                )
            }

            render(createElement(TestComponent))
            expect(instance.scope("modal").isActive()).toBe(true)
        })

        it("suppresses non-override scopes when override is active", () => {
            let globalCalled = false
            let modalCalled = false

            instance.bind(
                "ctrl+k",
                () => {
                    globalCalled = true
                },
                { scope: "global" },
            )
            instance.bind(
                "ctrl+k",
                () => {
                    modalCalled = true
                },
                { scope: "modal" },
            )

            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "modal", override: true, instance },
                    createElement("div", null, "modal content"),
                )
            }

            render(createElement(TestComponent))
            act(() => fireKey("k", "keydown", { ctrlKey: true }))

            expect(modalCalled).toBe(true)
            expect(globalCalled).toBe(true)
        })

        it("restores normal scope behavior after override scope unmounts", () => {
            let editorCalled = false
            instance.bind(
                "ctrl+k",
                () => {
                    editorCalled = true
                },
                { scope: "editor" },
            )
            instance.scope("editor").activate()

            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "modal", override: true, instance },
                    createElement("div", null, "modal"),
                )
            }

            const { unmount } = render(createElement(TestComponent))
            act(() => fireKey("k", "keydown", { ctrlKey: true }))
            expect(editorCalled).toBe(false)

            unmount()
            act(() => fireKey("k", "keydown", { ctrlKey: true }))
            expect(editorCalled).toBe(true)
        })
    })

    describe("rendering", () => {
        it("renders children", () => {
            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "editor", instance },
                    createElement("div", { "data-testid": "child" }, "hello"),
                )
            }

            const { getByTestId } = render(createElement(TestComponent))
            expect(getByTestId("child").textContent).toBe("hello")
        })

        it("renders multiple children", () => {
            function TestComponent() {
                return createElement(
                    KeystrokScope,
                    { name: "editor", instance },
                    createElement("div", { "data-testid": "first" }, "first"),
                    createElement("div", { "data-testid": "second" }, "second"),
                )
            }

            const { getByTestId } = render(createElement(TestComponent))
            expect(getByTestId("first").textContent).toBe("first")
            expect(getByTestId("second").textContent).toBe("second")
        })
    })
})
