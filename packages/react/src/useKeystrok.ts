import { useEffect, useRef } from "react"
import { keystrok, Keystrok } from "keystrok"
import type { ShortcutOptions, HandlerFn } from "keystrok"

/**
 * Bind a keyboard shortcut in a React component.
 * Automatically unbinds when the component unmounts.
 *
 * @param shortcut - A shortcut string ("ctrl+k") or a sequence (["g", "b"])
 * @param handler  - The function to call when the shortcut fires
 * @param options  - Optional scope, event type, preventDefault, once
 * @param instance - Optional custom Keystrok instance (defaults to global singleton)
 *
 * @example
 * useKeystrok('ctrl+k', () => openSearch())
 * useKeystrok(['g', 'b'], () => goBack(), { scope: 'editor' })
 */
export function useKeystrok(
    shortcut: string | string[],
    handler: HandlerFn,
    options: ShortcutOptions = {},
    instance: Keystrok = keystrok,
): void {
    const handlerRef = useRef<HandlerFn>(handler)

    // update synchronously during render so it's always current before any event fires
    handlerRef.current = handler

    useEffect(() => {
        const stableHandler: HandlerFn = (e: KeyboardEvent) => handlerRef.current(e)

        instance.bind(shortcut, stableHandler, options)

        return () => {
            instance.unbind(shortcut)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        Array.isArray(shortcut) ? shortcut.join("+") : shortcut,
        options.scope,
        options.event,
        options.once,
        options.preventDefault,
        instance,
    ])
}
