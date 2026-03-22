# API reference

## keystrok (core)

### `keystrok.bind(shortcut, handler, options?)`

Binds a shortcut to a handler function.

```ts
keystrok.bind(shortcut: string | string[], handler: HandlerFn, options?: ShortcutOptions): this
```

| Parameter  | Type                             | Description                                               |
| ---------- | -------------------------------- | --------------------------------------------------------- |
| `shortcut` | `string \| string[]`             | A shortcut string (`"ctrl+k"`) or sequence (`["g", "b"]`) |
| `handler`  | `(event: KeyboardEvent) => void` | Function to call when the shortcut fires                  |
| `options`  | `ShortcutOptions`                | Optional configuration                                    |

Returns the instance for chaining.

```ts
keystrok.bind("ctrl+k", openSearch).bind("ctrl+s", save).bind("ctrl+z", undo)
```

---

### `keystrok.unbind(shortcut)`

Removes all bindings for the given shortcut.

```ts
keystrok.unbind(shortcut: string | string[]): this
```

```ts
keystrok.unbind("ctrl+k")
keystrok.unbind(["g", "b"])
```

---

### `keystrok.scope(name)`

Returns a scope controller for the given scope name.

```ts
keystrok.scope(name: string): {
  activate: () => Keystrok
  deactivate: () => Keystrok
  override: () => Keystrok
  isActive: () => boolean
}
```

```ts
keystrok.scope("editor").activate()
keystrok.scope("editor").deactivate()
keystrok.scope("modal").override() // suppresses all other scopes
keystrok.scope("editor").isActive() // → boolean
```

---

### `keystrok.start()`

Starts listening to keyboard events. Called automatically on construction.

```ts
keystrok.start(): void
```

---

### `keystrok.stop()`

Stops listening to keyboard events without removing bindings.

```ts
keystrok.stop(): void
```

---

### `keystrok.destroy()`

Removes all bindings and stops listening to keyboard events.

```ts
keystrok.destroy(): void
```

---

### `createKeystrok()`

Creates a new isolated Keystrok instance. Useful for testing or when you need multiple independent instances.

```ts
import { createKeystrok } from "keystrok"

const ks = createKeystrok()
ks.bind("ctrl+k", handler)
```

---

## ShortcutOptions

```ts
interface ShortcutOptions {
    scope?: string // defaults to 'global'
    event?: "keydown" | "keyup" // defaults to 'keydown'
    preventDefault?: boolean // defaults to false
    once?: boolean // defaults to false
}
```

| Option           | Type                   | Default     | Description                              |
| ---------------- | ---------------------- | ----------- | ---------------------------------------- |
| `scope`          | `string`               | `'global'`  | Scope this binding belongs to            |
| `event`          | `'keydown' \| 'keyup'` | `'keydown'` | Which keyboard event to listen on        |
| `preventDefault` | `boolean`              | `false`     | Whether to call `event.preventDefault()` |
| `once`           | `boolean`              | `false`     | Unbind automatically after firing once   |

---

## keystrok/react

### `useKeystrok(shortcut, handler, options?, instance?)`

Binds a keyboard shortcut in a React component. Automatically unbinds when the component unmounts.

```ts
useKeystrok(
  shortcut: string | string[],
  handler: HandlerFn,
  options?: ShortcutOptions,
  instance?: Keystrok
): void
```

| Parameter  | Type                 | Description                                    |
| ---------- | -------------------- | ---------------------------------------------- |
| `shortcut` | `string \| string[]` | A shortcut string or sequence                  |
| `handler`  | `HandlerFn`          | Function to call when the shortcut fires       |
| `options`  | `ShortcutOptions`    | Optional configuration                         |
| `instance` | `Keystrok`           | Custom instance — defaults to global singleton |

```tsx
function App() {
    useKeystrok("ctrl+k", () => openSearch())
    useKeystrok("ctrl+s", () => save(), { preventDefault: true })
    useKeystrok(["g", "b"], () => goBack(), { scope: "editor" })

    return <div>...</div>
}
```

The handler is always kept up to date — if the handler function changes between renders, the latest version is always called without re-registering the binding.

---

### `<KeystrokScope>`

Activates a keystrok scope while mounted and deactivates it on unmount.

```tsx
<KeystrokScope name="editor" override={false} instance={keystrok}>
    {children}
</KeystrokScope>
```

| Prop       | Type        | Default          | Description                                             |
| ---------- | ----------- | ---------------- | ------------------------------------------------------- |
| `name`     | `string`    | —                | The scope name to activate                              |
| `override` | `boolean`   | `false`          | Activate in override mode, suppressing all other scopes |
| `instance` | `Keystrok`  | global singleton | Custom Keystrok instance                                |
| `children` | `ReactNode` | —                | Child components                                        |

```tsx
// basic scope
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

// with custom instance
;<KeystrokScope name="editor" instance={ks}>
    <Editor />
</KeystrokScope>
```

---

## Types

```ts
import type { HandlerFn, ShortcutOptions, Binding, ParsedKey, ScopeState, Modifier, KeyEvent } from "keystrok"

// Handler function
type HandlerFn = (event: KeyboardEvent) => void

// Modifier keys
type Modifier = "ctrl" | "shift" | "alt" | "meta"

// Keyboard event types
type KeyEvent = "keydown" | "keyup"

// Parsed shortcut
interface ParsedKey {
    key: string
    modifiers: Set<Modifier>
}

// Scope state
interface ScopeState {
    name: string
    active: boolean
    override: boolean
}
```
