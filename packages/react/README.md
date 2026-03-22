# keystrok-react

React bindings for [keystrok](https://www.npmjs.com/package/keystrok) — `useKeystrok()` hook and `<KeystrokScope>` component.

## Installation

```bash
npm install keystrok keystrok-react
```

## Quick start

```tsx
import { useKeystrok, KeystrokScope } from "keystrok-react"

function App() {
    useKeystrok("ctrl+k", () => openSearch())
    useKeystrok("ctrl+s", () => save(), { preventDefault: true })
    useKeystrok(["g", "h"], () => goHome())

    return (
        <KeystrokScope name="editor">
            <Editor />
        </KeystrokScope>
    )
}
```

## `useKeystrok`

Binds a keyboard shortcut in a React component. Automatically unbinds on unmount.

```tsx
useKeystrok(shortcut, handler, options?, instance?)
```

```tsx
// basic
useKeystrok("ctrl+k", () => openSearch())

// with options
useKeystrok("ctrl+s", save, { preventDefault: true })

// scoped
useKeystrok("ctrl+b", bold, { scope: "editor" })

// sequence
useKeystrok(["g", "b"], goBack)

// custom instance
useKeystrok("ctrl+k", handler, {}, ks)
```

The handler is always kept up to date — if it changes between renders, the latest version fires without re-registering the binding.

## `<KeystrokScope>`

Activates a scope while mounted, deactivates on unmount.

```tsx
// basic scope
;<KeystrokScope name="editor">
    <Editor />
</KeystrokScope>

// override mode — suppresses all other scopes (perfect for modals)
{
    modalOpen && (
        <KeystrokScope name="modal" override>
            <Modal />
        </KeystrokScope>
    )
}

// custom instance
;<KeystrokScope name="editor" instance={ks}>
    <Editor />
</KeystrokScope>
```

## Multiple instances

```tsx
import { createKeystrok } from "keystrok"
import { useKeystrok, KeystrokScope } from "keystrok-react"

const ks = createKeystrok()

function App() {
    useKeystrok("ctrl+k", handler, {}, ks)

    return (
        <KeystrokScope name="editor" instance={ks}>
            <Editor />
        </KeystrokScope>
    )
}
```

## Documentation

- [Getting started](https://github.com/kunaltanwar/keystrok/blob/main/docs/getting-started.md)
- [API reference](https://github.com/kunaltanwar/keystrok/blob/main/docs/api.md)

## License

[MIT](../../LICENSE.md)
