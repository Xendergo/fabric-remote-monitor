import { Pages } from "../networking/sendableTypes"
import { database } from "./DatabaseManager"
import { pages as DBPage } from "./Databases/1.0.0"

export let pages: Pages = new Pages(database.getRows("pages"))

export function updatePages(newPages: Pages) {
    database.delete<DBPage>("pages")

    for (const page of newPages.pages) {
        database.addRow<DBPage>("pages", {
            data: page.data,
            title: page.title,
            ordinal: page.ordinal,
        })
    }

    pages = newPages
}
