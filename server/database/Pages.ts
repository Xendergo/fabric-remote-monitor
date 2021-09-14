import { Pages } from "../networking/sendableTypes"
import { database } from "./DatabaseManager"

export let pages: Pages

database.getPages().then(data => {
    pages = new Pages(data)
})

export function updatePages(newPages: Pages) {
    database.deletePages()

    for (const page of newPages.pages) {
        database.addPage({
            data: page.data,
            title: page.title,
            ordinal: page.ordinal,
        })
    }

    pages = newPages
}
