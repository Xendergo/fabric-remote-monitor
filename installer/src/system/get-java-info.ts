import { type } from 'os';
import { promisify } from 'util';
import { exec as execUnpromisified } from 'child_process';
const exec = promisify(execUnpromisified);

// TODO: Refactor + Add Windows Support
export async function getJavaInfo() {
    let javaHome: String;
    let jreHome: String;
    let javaVersion: String;
    let validJavaInstall: Boolean;
    if (type() == 'Linux' || type() == 'Darwin') {
        javaHome = exec('echo $JAVA_HOME').toString().trim()
        jreHome = exec('echo $JRE_HOME').toString().trim()
        
        // Defaults to whatever java version is loaded in path
        // I'm not certain whether I should check the version of the jdk / jre
        // Maybe a future feature?
        try {
            javaVersion = await checkJavaVersion()
            validJavaInstall = true
        } catch (err) {
            // defaults to jreHome over javaHome, though will check if javaHome exists
            if (javaHome) {
                try {
                    javaVersion = await checkJavaVersion(javaHome)
                    validJavaInstall = true
                } catch (err) {
                    javaVersion = undefined
                    validJavaInstall = false
                    console.error('JAVA_HOME NOT VALID')
                    console.log("ERROR: ",err)
                }
            }
            if (jreHome) {
                try {
                    javaVersion = await checkJavaVersion(jreHome)
                    validJavaInstall = true
                } catch (err) {
                    validJavaInstall = false
                    console.error('JRE_HOME NOT VALID')
                    console.log("ERROR: ",err)
                }
            }
        }
    } else if (type() == 'Windows_NT') {
        // untested / unverified
        javaHome = exec('echo %JAVA_HOME%').toString().trim()
        jreHome = exec('echo %JRE_HOME%').toString().trim()

        console.log(javaHome, jreHome);
    } else {
        console.error('Sorry. We do not support your system')
        throw 'We do not support your system. :('
    }
    // look for the exact version
    javaVersion = javaVersion.match(/".+"/)[0];
    return {
        javaVersion,
        validJavaInstall
    }
}

async function checkJavaVersion(path?: String) {
    return (await exec(`${path? path : 'java'} -version`, {
        encoding: 'utf-8'
    })).stderr
}
