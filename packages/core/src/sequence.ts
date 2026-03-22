// How long to wait (ms) before resetting the sequence buffer
const SEQUENCE_TIMEOUT_MS = 1000

export class SequenceMatcher {
    private buffer: string[] = []
    private timer: ReturnType<typeof setTimeout> | null = null
    private onReset: (() => void) | null = null

    /**
     * Feed a KeyboardEvent into the sequence buffer.
     * Returns the matched sequence string[] if a registered sequence
     * is completed, otherwise null.
     */
    push(event: KeyboardEvent, sequences: string[][]): string[] | null {
        const key = event.key

        this.buffer.push(key)
        this.resetTimer()

        const match = this.findMatch(sequences)

        if (match) {
            this.reset()

            return match
        }

        if (!this.hasPartialMatch(sequences)) {
            this.reset()
        }

        return null
    }

    setOnReset(fn: () => void): void {
        this.onReset = fn
    }

    reset(): void {
        this.buffer = []

        if (this.timer !== null) {
            clearTimeout(this.timer)

            this.timer = null
        }

        this.onReset?.()
    }

    getBuffer(): string[] {
        return [...this.buffer]
    }

    private findMatch(sequences: string[][]): string[] | null {
        for (const sequence of sequences) {
            if (sequence.length !== this.buffer.length) continue

            const matches = sequence.every((key, i) => this.buffer[i]?.toLowerCase() === key.toLowerCase())

            if (matches) return sequence
        }

        return null
    }

    /**
     * Returns true if any registered sequence starts with the current buffer.
     * Used to decide whether to keep buffering or reset early.
     */
    private hasPartialMatch(sequences: string[][]): boolean {
        return sequences.some((sequence) => {
            if (sequence.length <= this.buffer.length) return false

            return this.buffer.every((key, i) => sequence[i]?.toLowerCase() === key.toLowerCase())
        })
    }

    private resetTimer(): void {
        if (this.timer !== null) clearTimeout(this.timer)

        this.timer = setTimeout(() => {
            this.reset()
        }, SEQUENCE_TIMEOUT_MS)
    }
}
