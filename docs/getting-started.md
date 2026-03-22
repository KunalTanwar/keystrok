# Getting started

**keystrok** is a modern, TypeScript-native keyboard shortcut library that works correctly for everyone — including users on international and non-standard keyboard layouts.

## Why keystrok?

Every popular keyboard shortcut library uses deprecated browser APIs (`keyCode`, `which`, `code`) that break for users on non-English keyboard layouts. keystrok uses `KeyboardEvent.key` exclusively — the correct modern API — so your shortcuts work for everyone.

## Installation

```bash
# core (framework agnostic)
npm install keystrok

# React bindings
npm install keystrok-react
```

## Quick start

### Vanilla

```ts
import { keystrok } from "keystrok"

// bind a shortcut
keystrok.bind("ctrl+k", () => openSearch())

// bind with options
keystrok.bind("ctrl+s", (e) => save(), { preventDefault: true })

// unbind
keystrok.unbind("ctrl+k")
```

### React

```tsx
import { useKeystrok } from "keystrok-react"

function App() {
    useKeystrok("ctrl+k", () => openSearch())
    useKeystrok("ctrl+s", () => save(), { preventDefault: true })

    return <div>...</div>
}
```

## Shortcut syntax

Shortcuts are written as `modifier+key` strings. Modifiers are separated from the key by `+`.

```ts
"ctrl+k" // Ctrl + K
"shift+a" // Shift + A
"ctrl+shift+p" // Ctrl + Shift + P
"meta+k" // Cmd/Win + K
"cmd+k" // alias for meta+k
"alt+f" // Alt + F
```

### Supported modifiers

| Modifier | Aliases                 |
| -------- | ----------------------- |
| `ctrl`   | `control`               |
| `shift`  | —                       |
| `alt`    | `option`                |
| `meta`   | `cmd`, `command`, `win` |

### Special keys

```ts
"enter" // Enter
"escape" // Escape (also: 'esc')
"space" // Space
"tab" // Tab
"backspace" // Backspace
"delete" // Delete (also: 'del')
"up" // ArrowUp
"down" // ArrowDown
"left" // ArrowLeft
"right" // ArrowRight
"home" // Home
"end" // End
"pageup" // PageUp
"pagedown" // PageDown
```

## Sequences

Sequences are multi-step shortcuts — press one key, then another.

```ts
// bind a sequence
keystrok.bind(["g", "h"], () => goHome())
keystrok.bind(["g", "s"], () => goSettings())

// React
useKeystrok(["g", "b"], () => goBack())
```

The sequence buffer resets after 1 second of inactivity.

## Scopes

Scopes let you activate different sets of shortcuts depending on the context — for example, different shortcuts when a modal is open vs when the editor is focused.

```ts
// bind to a specific scope
keystrok.bind("ctrl+b", () => bold(), { scope: "editor" })
keystrok.bind("escape", () => close(), { scope: "modal" })

// activate a scope
keystrok.scope("editor").activate()

// deactivate a scope
keystrok.scope("editor").deactivate()

// override mode — suppresses all other scopes (useful for modals)
keystrok.scope("modal").override()

// check if a scope is active
keystrok.scope("editor").isActive()
```

The `global` scope is always active and cannot be deactivated.

### Scopes in React

Use `KeystrokScope` to automatically activate and deactivate a scope based on component mount state:

```tsx
import { KeystrokScope } from 'keystrok-react'

// activates 'editor' scope while mounted
<KeystrokScope name="editor">
  <Editor />
</KeystrokScope>

// override mode — suppresses all other scopes while modal is open
<KeystrokScope name="modal" override>
  <Modal />
</KeystrokScope>
```

## Options

All bindings accept an optional options object:

```ts
keystrok.bind("ctrl+k", handler, {
    scope: "editor", // scope name, defaults to 'global'
    event: "keydown", // 'keydown' or 'keyup', defaults to 'keydown'
    preventDefault: true, // calls event.preventDefault(), defaults to false
    once: true, // unbinds after firing once, defaults to false
})
```

## Multiple instances

By default keystrok exports a singleton. For isolated instances — useful in testing or complex apps — use `createKeystrok()`:

```ts
import { createKeystrok } from 'keystrok'

const ks = createKeystrok()
ks.bind('ctrl+k', handler)

// pass to React hooks
useKeystrok('ctrl+k', handler, {}, ks)

// pass to KeystrokScope
<KeystrokScope name="editor" instance={ks}>
  <Editor />
</KeystrokScope>
```

## Conflict detection

In development, keystrok warns you when you bind the same shortcut twice in the same scope:

```
[keystrok] ⚠️ Conflict detected: "ctrl+k" is already bound in scope "global". Both handlers will fire.
```

This warning is a no-op in production — both handlers still fire safely.

## Lifecycle

```ts
// stop listening to keyboard events (bindings are preserved)
keystrok.stop()

// resume listening
keystrok.start()

// remove all bindings and stop listening
keystrok.destroy()
```
