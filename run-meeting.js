import {Builder, By, until} from 'selenium-webdriver';
import {rm, readFile, readdir, cp} from 'fs/promises';
import axios from "axios";
import {cudp, sp, udp} from './constants.js'
import {delay} from "./utils.js";
import chrome from "selenium-webdriver/chrome.js";
import puppeteer from "puppeteer";

export async function runSeparateBrowserInstances(eventId, url, duration) {
    const endTimeSimulate = 10000;
    let userDataPath = udp;
    let cloneUserDataPath = cudp + new Date().getTime() + '_' + eventId;
    let scriptPath = sp;
    let meetingName = 'MeetingNote-' + url.substring(24)
    console.log(meetingName)
    await cp(userDataPath, cloneUserDataPath, {recursive: true});

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--user-data-dir=' + cloneUserDataPath],
    })
    // let options = new chrome.Options();
    // options.addArguments(`--user-data-dir=` + cloneUserDataPath);
    // let driver = await new Builder()
    //     .forBrowser('chrome')
    //     .setChromeOptions(options)
    //     .build();

    try {
        // Perform actions with the WebDriver, e.g., navigate to a page
        await driver.get(url);

        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[span='Join now']"))), 600000)

        await driver.findElement(By.xpath("//button[span='Join now']")).click();
    } catch (error) {
        console.error(error);
    } finally {
        // Quit the driver
        setTimeout(async function () {
            await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[@aria-label='Leave call']"))), 10000)

            await driver.findElement(By.xpath("//button[@aria-label='Leave call']")).click()

            setTimeout(async function () {
                await driver.quit();

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

            }, 60000) //1min turn off call to quit driver wait for summary file

        }, duration + 60000); // 1min on top of call
    }
}

export async function runMultipleTabs(driver, url, duration) {
    await driver.switchTo().newWindow('tab');
    const thisWindowHandler = await driver.getWindowHandle();
    try {
        await driver.get(url);
        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[span='Join now']"))), 600000);
        await driver.findElement(By.xpath("//button[span='Join now']")).click();
        // confirm meet connection
        await delay(4000);
    } catch (error) {
        console.error(error);
    } finally {
        // Quit the driver
        setTimeout(async function () {
            await driver.switchTo().window(thisWindowHandler);
            await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[@aria-label='Leave call']"))), 10000);
            await driver.findElement(By.xpath("//button[@aria-label='Leave call']")).click();

            // setTimeout(async function () {
            //     await driver.quit();
            //
            //     // setTimeout(async function () {
            //     //     await rm(cloneUserDataPath, {recursive: true});
            //     //
            //     //     //fs get all files in directory
            //     //     const files = await readdir(scriptPath, {withFileTypes: true});
            //     //     const txtFiles =
            //     //         files.filter(file => file.isFile() && file.name.startsWith(meetingName) && file.name.endsWith('.txt'))
            //     //             .sort((a, b) => b.mtime - a.mtime)
            //     //             .at(0);
            //     //
            //     //     console.log(txtFiles.name)
            //     //     //read txt file
            //     //     const content = await readFile(scriptPath + txtFiles.name, 'utf8');
            //     //     //console.log(content)
            //     //     //submit data
            //     //     const options = {
            //     //         method: 'POST',
            //     //         url: 'http://chat-api-dev.campdi.vn/api/meeting/summary',
            //     //         data: {
            //     //             "eventId": eventId,
            //     //             "summary": content
            //     //         }
            //     //     };
            //     //
            //     //     try {
            //     //         const {data} = await axios.request(options);
            //     //         console.log(data);
            //     //     } catch (error) {
            //     //         console.error("failed" + error);
            //     //     }
            //     //
            //     // }, 3000)
            //
            // }, 60000) //1min turn off call to quit driver wait for summary file

        }, duration + 60000); // 1min on top of call
    }
}

