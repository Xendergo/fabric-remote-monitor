// Sets up an express server and or cli
// for the user to install Fabric Remote Monitor

import express from "express"
import { Sendable } from "../sendableTypes/sendableTypesHelpers"
// import kill from "kill-port";
import { installFabric } from "./fabric-install"

const app = express()

const port = 8080

app.use(express.static("build"))

console.log(`Server listening on port ${port}`)
app.listen(port)
