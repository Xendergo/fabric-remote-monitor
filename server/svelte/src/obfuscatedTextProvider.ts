import { readable, Readable } from "svelte/store"

function getObfuscatedCharacter(v: string) {
    return String.fromCharCode(Math.floor(Math.random() * 2036 + 0x21))
}

export function obfuscatedText(string: string): Readable<string> {
    return readable(string, set => {
        const interval = setInterval(() => {
            set(
                string
                    .split("")
                    .map(v => getObfuscatedCharacter(v))
                    .join("")
            )
        }, 100)

        return () => {
            clearInterval(interval)
        }
    })
}
