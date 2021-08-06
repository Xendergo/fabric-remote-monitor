import { Statement } from "better-sqlite3"
import { Pages } from "../networking/sendableTypes"
import { serverStateManager } from "../server-state/server-state"
import { DBReady } from "../server-state/serverStateMessages"
import { db } from "./Database"

let setPageData: Statement<{ data: string; id: number }>
let setPageTitle: Statement<{ title: string; id: number }>
let setPageOrdinal: Statement<{ ordinal: number; id: number }>
let addPage: Statement<{ title: string; data: string; ordinal: number }>

export let pages: Pages

serverStateManager.listen(DBReady, data => {
    const getPages = db.prepare("SELECT * FROM pages")
    setPageData = db.prepare("UPDATE pages SET data = $data WHERE id = $id")
    setPageTitle = db.prepare("UPDATE pages SET title = $title WHERE id = $id")
    setPageOrdinal = db.prepare(
        "UPDATE pages SET ordinal = $ordinal WHERE id = $id"
    )
    addPage = db.prepare(
        "INSERT INTO pages (title, data, ordinal) VALUES ($title, $data, $ordinal)"
    )

    pages = new Pages(getPages.all())
})
