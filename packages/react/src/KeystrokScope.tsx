import { keystrok, Keystrok } from "keystrok"
import { useEffect } from "react"

interface KeystrokScopeProps {
    // The scope name to activate while this component is mounted
    name: string
    /**
     * If true, activates the scope in override mode — suppressing all
     * other scopes while this component is mounted. Useful for modals.
     */
    override?: boolean
    // Optional custom Keystrok instance. Defaults to global singleton
    instance?: Keystrok
    children?: React.ReactNode
}

export function KeystrokScope({ name, override = false, instance = keystrok, children }: KeystrokScopeProps) {
    useEffect(() => {
        if (override) {
            instance.scope(name).override()
        } else {
            instance.scope(name).activate()
        }

        return () => {
            instance.scope(name).deactivate()
        }
    }, [name, override, instance])

    return <>{children}</>
}
