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
let deletePageStatement: Statement<{
    id: number
}>
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

    deletePageStatement = db.prepare("DELETE FROM pages WHERE id = $id")

    pages = new Pages(getPagesStatement.all())
})

export function updatePage(
    id: number,
    data: string,
    title: string,
    ordinal: number
) {
    const pagesMap = pages.getPages()

    if (pagesMap.has(id)) {
        updatePageStatement.run({
            id,
            data,
            title,
            ordinal,
        })

        const page = pagesMap.get(id)!

        page.data = data
        page.title = title
        page.ordinal = ordinal
    } else {
        addPageStatement.run({
            data,
            title,
            ordinal,
        })

        pages = new Pages(getPagesStatement.all())
    }
}

export function deletePage(id: number) {
    deletePageStatement.run({ id })
    pages.pages = pages.pages.filter(v => v.id !== id)
}
