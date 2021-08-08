import { Statement } from "better-sqlite3"
import { Pages } from "../networking/sendableTypes"
import { serverStateManager } from "../server-state/server-state"
import { DBReady } from "../server-state/serverStateMessages"
import { db } from "./Database"

let updatePageStatement: Statement<{
    data: string
    title: string
    ordinal: number
    id: number
}>
let addPageStatement: Statement<{
    title: string
    data: string
    ordinal: number
}>
let deletePagesStatement: Statement<any[]>
let getPagesStatement: Statement<any[]>

export let pages: Pages

serverStateManager.listen(DBReady, data => {
    getPagesStatement = db.prepare("SELECT * FROM pages")

    updatePageStatement = db.prepare(
        `UPDATE pages
         SET data = $data, title = $title, ordinal = $ordinal
         WHERE id = $id`
    )

    addPageStatement = db.prepare(
        "INSERT INTO pages (title, data, ordinal) VALUES ($title, $data, $ordinal)"
    )

    deletePagesStatement = db.prepare("DELETE FROM pages")

    pages = new Pages(getPagesStatement.all())
})

export function updatePages(newPages: Pages) {
    deletePagesStatement.run()

    for (const page of newPages.pages) {
        addPageStatement.run({
            data: page.data,
            title: page.title,
            ordinal: page.ordinal,
        })
    }

    pages = newPages
}
