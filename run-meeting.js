import {Builder, By, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import {cp, rm, readFile, readdir} from 'fs/promises';
import axios from "axios";
import parsedDate from "./parse-date.js";

//selenium + chrome, host chat-api-dev.campdi.vn
//FRecode extension for chrome
//trick lo clone user data to save login session
export default async function (eventId, url, duration) {
    // Specify the path to ChromeDriver and Chrome user data directory
    let userDataPath = 'C:/Users/leduc/AppData/Local/Google/Chrome/User Data';
    let cloneUserDataPath = 'C:/Users/leduc/Desktop/v/' + new Date().getTime() + '_' + eventId;
    let scriptPath = 'C:/Users/leduc/Downloads/Meowmo/';

    let meetingInitial = 'Transcript-' + url.substring(24) + '-'
    console.log("meeting initial: " + meetingInitial)

    await cp(userDataPath, cloneUserDataPath, {recursive: true});

    let options = new chrome.Options();
    options.addArguments(`--user-data-dir=` + cloneUserDataPath);

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Perform actions with the WebDriver, e.g., navigate to a page
        await driver.get(url);

        await driver.manage().setTimeouts({implicit: 2000}); //not sure

        await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//button[span='Join now']"))), 60000)

        await driver.findElement(By.xpath("//button[span='Join now']")).click();

        let loop = true
        // wait to admit newcomers and block the final clause for the duration of the meeting
        setTimeout(function () {
            loop = false
        }, duration)

        while (loop) {
            try {
                console.log("wait to admit newcomers")
                await driver.findElement(By.xpath("//button[@class='VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-dgl2Hf ksBjEc lKxP2d LQeN7' and @jscontroller='soHxf']")).click()
            } catch (e) {
                console.log("no newcomers")
            }
        }
    } finally {
        console.log("finally")

        // Quit the driver
        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[@aria-label='Leave call']"))), 10000)

        await driver.findElement(By.xpath("//button[@aria-label='Leave call']")).click()

        setTimeout(async function () {
            await driver.quit();

            setTimeout(async function () {
                await rm(cloneUserDataPath, {recursive: true});

                //fs get all files in script directory
                const files = await readdir(scriptPath, {withFileTypes: true});
                const txtFiles =
                    files.filter(file => file.isFile() && file.name.includes(meetingInitial, 0))
                        .sort((a, b) => {
                            const timeA = a.name.substring(meetingInitial.length, a.name.length - 4) // remove .txt
                            const timeB = b.name.substring(meetingInitial.length, b.name.length - 4)
                            const dateA = parsedDate(timeA)
                            const dateB = parsedDate(timeB)
                            return dateB - dateA;
                        }) //this sort could be overkill since meeting Initial is unique but Iam testing over and over again for a meeting
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

        }, 30000) //30s turn off call to quit driver
    }
};

