import process from "process"
import path from "path"
import { ChildProcess, spawn } from "child_process"

class FabricServerManager {
    installDir: string
    childInstance?: ChildProcess

    // new server manager instance
    constructor(installDirPath?: string) {
        if (installDirPath && !path.isAbsolute(installDirPath))
            throw Error("Fabric install directory path must be absolute")
        // default install location
        this.installDir = installDirPath
            ? installDirPath
            : path.resolve("../installer/fabric")
    }
    // verifies fabric install instance
    static verify() {
        // check for all the different files in a fabric install
        // I can't think of them off the top of my head, so
    }
    start() {
        console.log(this.installDir)
        process.chdir(this.installDir)
        this.childInstance = spawn("java", ["-jar", "fabric-server-launch.jar"])
    }
    stop() {}
    restart() {}
    /**
     * Returns nodejs stream of logs
     * Possibly consider saving logs to sqlite database?
     */
    logStream() {}
}

const test = new FabricServerManager()
test.start()
