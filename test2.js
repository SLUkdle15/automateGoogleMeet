import puppeteer from 'puppeteer';
import {Choice, cloneUserDataDir, executablePath, userDataPath, postSummary, delay} from './helpers.js';
import {rm, cp} from 'fs/promises';

export async function runSeparateBrowserInstancesUsingPuppeteer(eventId, url, duration) {
    let time = new Date().getTime();
    let choice = 1;
    let meetingName = 'MeetingNote-' + url.substring(24, 36);
    switch (choice) {
        case Choice.SeparateBrowserInstances:
            let cloneUserDataPath = cloneUserDataDir + time + '_' + eventId;
            await cp(userDataPath, cloneUserDataPath, {recursive: true});
            const browser = await puppeteer.launch({
                headless: false,
                executablePath: executablePath,
                userDataDir: cloneUserDataPath,
                ignoreDefaultArgs: [
                    '--mute-audio',
                    '--disable-extensions',
                ],
                defaultViewport: null,
            });
            // TODO: close about:blank tab that was initially opened by default
            // open a new tab, go to the meeting url and click join
            const page = await browser.newPage();
            await page.goto(url);
            await page.locator('xpath///button[span=\'Join now\']').click();
            await delay(duration + 30000); // wait for specified meeting duration + additional 30s before leaving the call TODO: why 30s
            await page.locator('xpath///button[@aria-label=\'Leave call\']').click(); // click leave
            await delay(20000); // wait for FRecord output before closing the browser instance
            await browser.close();
            await delay(10000); // wait for browser closure before deleting the cloned userData and post the summary
            await rm(cloneUserDataPath, {recursive: true});
            await postSummary(eventId, meetingName);
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