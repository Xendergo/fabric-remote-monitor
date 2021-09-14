import { Pages } from "../networking/sendableTypes"
import { database } from "./DatabaseManager"

export let pages: Pages

database.getPages().then(data => {
    pages = new Pages(data)
})

export async function updatePages(newPages: Pages) {
    await database.deletePages()

    for (const page of newPages.pages) {
        database.addPage(page)
    }

    pages = newPages
}
