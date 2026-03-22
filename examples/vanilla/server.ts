import { serve } from "bun"
import { resolve, extname } from "path"

const ROOT = resolve(import.meta.dir, "../..")

serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url)
        let path = url.pathname === "/" ? "/examples/vanilla/index.html" : url.pathname
        const filePath = resolve(ROOT, "." + path)

        try {
            if (extname(filePath) === ".ts") {
                const result = await Bun.build({
                    entrypoints: [filePath],
                    target: "browser",
                })
                const output = await result.outputs[0]?.text()
                return new Response(output, {
                    headers: { "Content-Type": "application/javascript" },
                })
            }

            const file = Bun.file(filePath)
            return new Response(file)
        } catch {
            return new Response("Not found", { status: 404 })
        }
    },
})

console.log("Dev server running at http://localhost:3000")
