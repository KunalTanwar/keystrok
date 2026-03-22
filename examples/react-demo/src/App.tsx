import { useState, useCallback } from "react"
import { createKeystrok } from "keystrok"
import { useKeystrok, KeystrokScope } from "keystrok-react"
import "./App.css"

const ks = createKeystrok()

type ToastType = "success" | "info" | "warning"

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface EditorState {
    content: string
    bold: boolean
    italic: boolean
    saved: boolean
    history: string[]
    historyIndex: number
}

let toastId = 0

export default function App() {
    const [editor, setEditor] = useState<EditorState>({
        content: "Start typing here...\n\nTry the keyboard shortcuts on the right →",
        bold: false,
        italic: false,
        saved: true,
        history: ["Start typing here...\n\nTry the keyboard shortcuts on the right →"],
        historyIndex: 0,
    })
    const [toasts, setToasts] = useState<Toast[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

    function addToast(message: string, type: ToastType = "info") {
        const id = ++toastId
        setToasts((t) => [...t, { id, message, type }])
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
    }

    function flashKey(key: string) {
        setActiveKeys((k) => new Set(k).add(key))
        setTimeout(
            () =>
                setActiveKeys((k) => {
                    const next = new Set(k)
                    next.delete(key)
                    return next
                }),
            300,
        )
    }

    const handleBold = useCallback(() => {
        setEditor((e) => ({ ...e, bold: !e.bold }))
        flashKey("ctrl+b")
        addToast(`Bold ${editor.bold ? "off" : "on"}`, "info")
    }, [editor.bold])

    const handleItalic = useCallback(() => {
        setEditor((e) => ({ ...e, italic: !e.italic }))
        flashKey("ctrl+i")
        addToast(`Italic ${editor.italic ? "off" : "on"}`, "info")
    }, [editor.italic])

    const handleSave = useCallback(() => {
        setEditor((e) => ({ ...e, saved: true }))
        flashKey("ctrl+s")
        addToast("Document saved", "success")
    }, [])

    const handleUndo = useCallback(() => {
        setEditor((e) => {
            if (e.historyIndex <= 0) {
                addToast("Nothing to undo", "warning")
                return e
            }
            const newIndex = e.historyIndex - 1
            addToast("Undo", "info")
            flashKey("ctrl+z")
            return { ...e, content: e.history[newIndex] ?? e.content, historyIndex: newIndex, saved: false }
        })
    }, [])

    const handleRedo = useCallback(() => {
        setEditor((e) => {
            if (e.historyIndex >= e.history.length - 1) {
                addToast("Nothing to redo", "warning")
                return e
            }
            const newIndex = e.historyIndex + 1
            addToast("Redo", "info")
            flashKey("ctrl+shift+z")
            return { ...e, content: e.history[newIndex] ?? e.content, historyIndex: newIndex, saved: false }
        })
    }, [])

    const handleOpenLink = useCallback(() => {
        setModalOpen(true)
        flashKey("ctrl+k")
    }, [])

    const handleCloseModal = useCallback(() => {
        setModalOpen(false)
        setLinkUrl("")
    }, [])

    const handleInsertLink = useCallback(() => {
        if (!linkUrl) return
        setEditor((e) => ({ ...e, content: e.content + ` [${linkUrl}]`, saved: false }))
        addToast(`Link inserted`, "success")
        handleCloseModal()
    }, [linkUrl, handleCloseModal])

    function handleContentChange(val: string) {
        setEditor((e) => {
            const newHistory = e.history.slice(0, e.historyIndex + 1)
            newHistory.push(val)
            return {
                ...e,
                content: val,
                saved: false,
                history: newHistory,
                historyIndex: newHistory.length - 1,
            }
        })
    }

    // global shortcuts
    useKeystrok("ctrl+b", handleBold, { preventDefault: true }, ks)
    useKeystrok("ctrl+i", handleItalic, { preventDefault: true }, ks)
    useKeystrok("ctrl+s", handleSave, { preventDefault: true }, ks)
    useKeystrok("ctrl+z", handleUndo, { preventDefault: true }, ks)
    useKeystrok("ctrl+shift+z", handleRedo, { preventDefault: true }, ks)
    useKeystrok("ctrl+k", handleOpenLink, { preventDefault: true }, ks)

    // modal shortcuts
    useKeystrok("escape", handleCloseModal, { scope: "modal" }, ks)
    useKeystrok("enter", handleInsertLink, { scope: "modal" }, ks)

    return (
        <div className="app">
            {/* toasts */}
            <div className="toasts">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="layout">
                {/* editor panel */}
                <div className="editor-panel">
                    <div className="editor-toolbar">
                        <span className="editor-title">untitled.md</span>
                        <div className="toolbar-badges">
                            {editor.bold && <span className="badge">B</span>}
                            {editor.italic && <span className="badge">I</span>}
                            <span className={`save-status ${editor.saved ? "saved" : "unsaved"}`}>
                                {editor.saved ? "● saved" : "○ unsaved"}
                            </span>
                        </div>
                    </div>
                    <textarea
                        className="editor-textarea"
                        style={{
                            fontWeight: editor.bold ? "bold" : "normal",
                            fontStyle: editor.italic ? "italic" : "normal",
                        }}
                        value={editor.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                {/* shortcuts panel */}
                <div className="shortcuts-panel">
                    <h2>Shortcuts</h2>
                    <div className="shortcut-groups">
                        <div className="shortcut-group">
                            <h3>Formatting</h3>
                            <ShortcutRow label="Bold" keys={["Ctrl", "B"]} active={activeKeys.has("ctrl+b")} />
                            <ShortcutRow label="Italic" keys={["Ctrl", "I"]} active={activeKeys.has("ctrl+i")} />
                        </div>
                        <div className="shortcut-group">
                            <h3>Document</h3>
                            <ShortcutRow label="Save" keys={["Ctrl", "S"]} active={activeKeys.has("ctrl+s")} />
                            <ShortcutRow label="Undo" keys={["Ctrl", "Z"]} active={activeKeys.has("ctrl+z")} />
                            <ShortcutRow
                                label="Redo"
                                keys={["Ctrl", "⇧", "Z"]}
                                active={activeKeys.has("ctrl+shift+z")}
                            />
                        </div>
                        <div className="shortcut-group">
                            <h3>Insert</h3>
                            <ShortcutRow label="Insert link" keys={["Ctrl", "K"]} active={activeKeys.has("ctrl+k")} />
                        </div>
                        <div className="shortcut-group">
                            <h3>Modal scope</h3>
                            <ShortcutRow label="Confirm" keys={["Enter"]} active={false} scope="modal" />
                            <ShortcutRow label="Close" keys={["Escape"]} active={false} scope="modal" />
                        </div>
                    </div>
                </div>
            </div>

            {/* modal */}
            {modalOpen && (
                <KeystrokScope name="modal" override instance={ks}>
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Insert link</h3>
                            <p className="modal-hint">
                                Press <kbd>Enter</kbd> to confirm, <kbd>Escape</kbd> to close
                            </p>
                            <input
                                autoFocus
                                className="modal-input"
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                            />
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleInsertLink}>
                                    Insert
                                </button>
                            </div>
                        </div>
                    </div>
                </KeystrokScope>
            )}
        </div>
    )
}

function ShortcutRow({
    label,
    keys,
    active,
    scope,
}: {
    label: string
    keys: string[]
    active: boolean
    scope?: string
}) {
    return (
        <div className={`shortcut-row ${active ? "active" : ""}`}>
            <span className="shortcut-label">{label}</span>
            <div className="shortcut-keys">
                {scope && <span className="scope-badge">{scope}</span>}
                {keys.map((k, i) => (
                    <kbd key={i}>{k}</kbd>
                ))}
            </div>
        </div>
    )
}
