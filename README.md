# keystrok

A modern, TypeScript-native keyboard shortcut library that actually works for everyone — including users on international and non-standard keyboard layouts.

## The problem with existing libraries

Every popular keyboard shortcut library uses deprecated browser APIs:

| Library            | API used                    |
| ------------------ | --------------------------- |
| mousetrap          | `which` (deprecated)        |
| hotkeys-js         | `keyCode` (deprecated)      |
| react-hotkeys-hook | `code` (incorrect for i18n) |
| combokeys          | `which` (deprecated)        |

These APIs break for users on non-English keyboards. keystrok uses `KeyboardEvent.key` exclusively — the correct modern API — so shortcuts work for everyone.

## Features

- **`KeyboardEvent.key` based** — correct behavior on all keyboard layouts
- **TypeScript-native** — written in TypeScript from day one, not an afterthought
- **Scoped shortcuts** — activate different shortcuts based on context
- **Sequence shortcuts** — multi-step shortcuts like `g` then `b`
- **Conflict detection** — dev-time warnings for duplicate bindings
- **React bindings** — `useKeystrok()` hook and `<KeystrokScope>` component
- **Zero dependencies** — lightweight core with no runtime deps
- **Framework agnostic** — use with React, Vue, Svelte, or vanilla JS

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

keystrok.bind("ctrl+k", () => openSearch())
keystrok.bind("ctrl+s", save, { preventDefault: true })
keystrok.bind(["g", "h"], () => goHome()) // sequence
keystrok.unbind("ctrl+k")
```

### React

```tsx
import { useKeystrok, KeystrokScope } from "keystrok-react"

function App() {
    useKeystrok("ctrl+k", () => openSearch())
    useKeystrok("ctrl+s", () => save(), { preventDefault: true })

    return (
        <KeystrokScope name="editor">
            <Editor />
        </KeystrokScope>
    )
}
```

## Shortcut syntax

```ts
"ctrl+k" // Ctrl + K
"ctrl+shift+p" // Ctrl + Shift + P
"cmd+k" // Cmd/Win + K (alias for meta)
"alt+f" // Alt + F
"escape" // Escape
"ctrl+enter" // Ctrl + Enter
"?" // ? (shift-variants work naturally)
```

### Modifier aliases

| Canonical | Aliases                 |
| --------- | ----------------------- |
| `ctrl`    | `control`               |
| `alt`     | `option`                |
| `meta`    | `cmd`, `command`, `win` |

## Scopes

```ts
// bind to a scope
keystrok.bind("ctrl+b", bold, { scope: "editor" })
keystrok.bind("escape", close, { scope: "modal" })

// activate / deactivate
keystrok.scope("editor").activate()
keystrok.scope("editor").deactivate()

// override mode — suppresses all other scopes
keystrok.scope("modal").override()
```

```tsx
// React — auto activates/deactivates on mount/unmount
;<KeystrokScope name="editor">
    <Editor />
</KeystrokScope>

// override mode for modals
{
    modalOpen && (
        <KeystrokScope name="modal" override>
            <Modal />
        </KeystrokScope>
    )
}
```

## Sequences

```ts
keystrok.bind(["g", "h"], () => goHome())
keystrok.bind(["g", "s"], () => goSettings())

// React
useKeystrok(["g", "b"], () => goBack())
```

The sequence buffer resets after 1 second of inactivity.

## Options

```ts
keystrok.bind("ctrl+k", handler, {
    scope: "editor", // defaults to 'global'
    event: "keydown", // or 'keyup', defaults to 'keydown'
    preventDefault: true, // defaults to false
    once: true, // unbind after firing once, defaults to false
})
```

## Multiple instances

```ts
import { createKeystrok } from 'keystrok'

const ks = createKeystrok()
ks.bind('ctrl+k', handler)

// pass to React bindings
useKeystrok('ctrl+k', handler, {}, ks)
<KeystrokScope name="editor" instance={ks}>...</KeystrokScope>
```

## Conflict detection

In development, keystrok warns when the same shortcut is bound twice in the same scope:

```
[keystrok] ⚠️ Conflict detected: "ctrl+k" is already bound in scope "global". Both handlers will fire.
```

## Lifecycle

```ts
keystrok.stop() // stop listening (bindings preserved)
keystrok.start() // resume listening
keystrok.destroy() // remove all bindings and stop
```

## Documentation

- [Getting started](./docs/getting-started.md)
- [API reference](./docs/api.md)

## License

[MIT](LICENSE.md)
