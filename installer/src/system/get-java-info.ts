import { type } from 'os';
import { execSync as exec } from 'child_process';

export async function getJavaInfo() {
	if (type() == 'Linux' || type() == 'Darwin') {
		const javaHome = exec('echo $JAVA_HOME') ?? undefined;
		const jreHome = exec('echo $JRE_HOME') ?? undefined;
		const javaVersion = exec('java -version');

		console.log(javaVersion.toString('utf8'));

		console.log(javaHome.toString('utf8'), jreHome.toString('utf8'));
	} else if (type() == 'Windows_NT') {
		// untested / unverified
		const javaHome = exec('echo %JAVA_HOME%');
		const jreHome = exec('echo %JRE_HOME%');
		console.log(javaHome, jreHome);
	} else {
		console.error('Sorry. We do not support your system');
	}
	return {
		bruh: 'bruh'
	};
}
