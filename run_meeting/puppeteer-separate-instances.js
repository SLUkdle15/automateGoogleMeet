import {cloneUserDataDir, delay, executablePath, postSummary, userDataPath} from "../helpers.js";
import {cp, rm} from "fs/promises";
import puppeteer from "puppeteer";

export async function runSeparateInstancesUsingPuppeteer(eventId, url, duration) {
    let time = new Date().getTime();
    let meetingName = 'MeetingNote-' + url.substring(24, 36);
    let cloneUserDataPath = cloneUserDataDir + time + '_' + eventId;
    console.log('cloning user data');
    await cp(userDataPath, cloneUserDataPath, {recursive: true});
    console.log('launching instance for' + url);
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
    // open a new tab, go to the meeting url and click join
    console.log('opening new page');
    const page = await browser.newPage();
    await page.goto(url);
    await page.locator('xpath///button[span=\'Join now\']').click();
    // wait for specified meeting duration + additional 30s before leaving the call TODO: why 30s
    await delay(duration + 30000);
    await page.locator('xpath///button[@aria-label=\'Leave call\']').click();
    // wait for FRecord output before closing the browser instance
    await delay(20000);
    await browser.close();
    // wait for browser closure before deleting the cloned userData and post the summary
    await delay(10000);
    await rm(cloneUserDataPath, {recursive: true});
    await postSummary(eventId, meetingName);
}