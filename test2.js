import puppeteer from "puppeteer";
import {Choice, cudp, ep, udp} from "./constants.js";
import {cp} from "fs/promises";
import {delay} from "./utils.js"

export async function runSeparateBrowserInstancesUsingPuppeteer(eventId, url, duration) {
    let userDataPath = udp;
    let time = new Date().getTime();
    let choice = 1;
    switch (choice) {
        case Choice.SeparateBrowserInstances:
                let cloneUserDataPath = cudp + time + '_' + eventId;
                await cp(userDataPath, cloneUserDataPath, {recursive: true});
                const browser = await puppeteer.launch({
                    headless: false,
                    executablePath: ep,
                    userDataDir: cloneUserDataPath,
                    ignoreDefaultArgs: [
                        '--mute-audio',
                        '--disable-extensions',
                    ],
                    defaultViewport: null,
                });
                const page = await browser.newPage();
                await page.goto(url);
                await page.locator('xpath///button[span=\'Join now\']').click();
                setTimeout(async function () {
                    await delay(10000);
                    page.locator('xpath///button[@aria-label=\'Leave call\']').click();
                    setTimeout(async function () {
                        browser.close();

                        setTimeout(async function () {
                            await rm(cloneUserDataPath, {recursive: true});

                            //fs get all files in directory
                            const files = await readdir(scriptPath, {withFileTypes: true});
                            const txtFiles =
                                files.filter(file => file.isFile() && file.name.startsWith(meetingName) && file.name.endsWith('.txt'))
                                    .sort((a, b) => b.mtime - a.mtime)
                                    .at(0);

                            console.log(txtFiles.name)
                            //read txt file
                            const content = await readFile(scriptPath + txtFiles.name, 'utf8');
                            //console.log(content)
                            //submit data
                            const options = {
                                method: 'POST',
                                url: 'http://chat-api-dev.campdi.vn/api/meeting/summary',
                                data: {
                                    "eventId": eventId,
                                    "summary": content
                                }
                            };

                            try {
                                const {data} = await axios.request(options);
                                console.log(data);
                            } catch (error) {
                                console.error("failed" + error);
                            }

                        }, 3000)
                    }, 10000);
                }, 30000 + duration);
            break;
//        case Choice.MultipleTabs:
//            let cloneUserDataPath = cudp + time;
//            await cp(userDataPath, cloneUserDataPath, {recursive: true});
//            // launch browser
//            const browser = await puppeteer.launch({
//                headless: false,
//                executablePath: ep,
//                userDataDir: cloneUserDataPath,
//                ignoreDefaultArgs: [
//                    '--mute-audio',
//                    '--disable-extensions',
//                ],
//                defaultViewport: null,
//            });
//            // loop to open each meeting on a tab
//            for (let i = 0; i < links.length; i++) {
//                const page = await browser.newPage();
//                await page.goto(url);
//                await page.locator('xpath///button[span=\'Join now\']').click();
//                setTimeout(async function () {
//                }, 30000);
//            }
//            break;
        }
}