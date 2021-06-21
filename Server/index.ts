import express from "express"

const app = express()

const port = 8000

app.use(express.static("./svelte/public"))

// fuser -k 8000/tcp
app.listen(port)