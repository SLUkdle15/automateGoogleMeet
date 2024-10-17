import puppeteer from "puppeteer";
import {Choice, cudp, ep, links, udp} from "./constants.js";
import {cp} from "fs/promises";

let userDataPath = udp;
let time = new Date().getTime();
let choice = 1;
switch (choice) {
    case Choice.SeparateBrowserInstances:
        for (let i = 0; i < links.length; i++) {
            let cloneUserDataPath = cudp + time + '_' + i;
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
            await page.goto(links[i]);
            await page.locator('xpath///button[span=\'Join now\']').click();
            setTimeout(async function () {
            }, 30000);
        }
        break;
    case Choice.MultipleTabs:
        let cloneUserDataPath = cudp + time;
        await cp(userDataPath, cloneUserDataPath, {recursive: true});
        // launch browser
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
        // loop to open each meeting on a tab
        for (let i = 0; i < links.length; i++) {
            const page = await browser.newPage();
            await page.goto(links[i]);
            await page.locator('xpath///button[span=\'Join now\']').click();
            setTimeout(async function () {
            }, 30000);
        }
        break;
}