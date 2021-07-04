// Sets up an express server and or cli
// for the user to install Fabric Remote Monitor

// NO SSL yet maybe because that's evil
import express from "express"
// import kill from "kill-port";
import { installFabric } from "./fabric-install"


const app = express();

const port = 8080;

app.use(express.static('build'));

// app.get('/', (req, res) => {
//   res.send('<html>bruh</html>');
//   res.end();
// })


console.log(`Server listening on port ${port}`);
app.listen(port);
// installFabric();