import { getJavaInfo } from "../../system/get-java-info";

export async function get() {
    console.log('request');
    return {
        body: await getJavaInfo()
    }
}