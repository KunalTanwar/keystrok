# keystrok

A modern, TypeScript-native keyboard shortcut library that works correctly for everyone — including users on international and non-standard keyboard layouts.

## Why keystrok?

Every popular keyboard shortcut library uses deprecated browser APIs (`keyCode`, `which`, `code`) that break for users on non-English keyboards. keystrok uses `KeyboardEvent.key` exclusively — the correct modern API.

## Installation

```bash
npm install keystrok
```

## Quick start

```ts
import { keystrok } from "keystrok"

// basic binding
keystrok.bind("ctrl+k", () => openSearch())

// with options
keystrok.bind("ctrl+s", save, { preventDefault: true })

// sequence shortcuts
keystrok.bind(["g", "h"], () => goHome())

// unbind
keystrok.unbind("ctrl+k")
```

## Scopes

```ts
keystrok.bind("ctrl+b", bold, { scope: "editor" })
keystrok.bind("escape", close, { scope: "modal" })

keystrok.scope("editor").activate()
keystrok.scope("editor").deactivate()
keystrok.scope("modal").override() // suppresses all other scopes
```

## Shortcut syntax

```ts
"ctrl+k" // Ctrl + K
"ctrl+shift+p" // Ctrl + Shift + P
"cmd+k" // Cmd/Win + K (alias for meta)
"alt+f" // Alt + F
"escape" // Escape
"space"[("g", "h")] // Space // sequence: g then h
```

## Options

```ts
keystrok.bind("ctrl+k", handler, {
    scope: "editor", // defaults to 'global'
    event: "keydown", // or 'keyup'
    preventDefault: true, // defaults to false
    once: true, // unbind after firing once
})
```

## Multiple instances

```ts
import { createKeystrok } from "keystrok"

const ks = createKeystrok()
ks.bind("ctrl+k", handler)
```

## React bindings

For React, install [`keystrok-react`](https://www.npmjs.com/package/keystrok-react):

```bash
npm install keystrok-react
```

## Documentation

- [Getting started](https://github.com/kunaltanwar/keystrok/blob/main/docs/getting-started.md)
- [API reference](https://github.com/kunaltanwar/keystrok/blob/main/docs/api.md)

## License

[MIT](../../LICENSE.md)
