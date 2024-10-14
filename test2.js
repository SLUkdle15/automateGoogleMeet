import puppeteer from "puppeteer";
import {cudp, udp} from "./constants.js";
import {cp} from "fs/promises";

// links array
let links = [
    'https://meet.google.com/yer-dxmj-wtc/',
    'https://meet.google.com/ffa-rhzh-nsf/'
]
let userDataPath = udp;
let time = new Date().getTime();
let cloneUserDataPath = cudp + time;
await cp(userDataPath, cloneUserDataPath, {recursive: true});
// delete some flags
const workingArgs = puppeteer.defaultArgs().filter(flag =>
    flag !== '--disable-extensions' ||
    flag !== '--headless=new' ||
    flag !== '--mute-audio');
// launch browser
const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: 'D:\\v\\' + time,
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