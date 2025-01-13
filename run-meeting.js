import {Builder, By, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import {cp, rm, readFile, readdir} from 'fs/promises';
import axios from "axios";
import parsedDate from "./parse-date.js";

//selenium + chrome, host chat-api-dev.campdi.vn
//FRecode extension for chrome
//trick lo clone user data to save login session
export default async function (eventId, url, duration) {
    const endTimeSimulate = 10000
    // Specify the path to ChromeDriver and Chrome user data directory
    let userDataPath = 'C:/Users/leduc/AppData/Local/Google/Chrome/User Data';
    let cloneUserDataPath = 'C:/Users/leduc/Desktop/v/' + new Date().getTime() + '_' + eventId;
    let scriptPath = 'C:/Users/leduc/Downloads/Meowmo/';

    let meetingName = 'Transcript-' + url.substring(24) + '-'
    console.log("meeting name: " + meetingName)
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

        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[span='Join now']"))), 600000)

        await driver.findElement(By.xpath("//button[span='Join now']")).click();
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
                        files.filter(file => file.isFile() && file.name.includes(meetingName, 0))
                            .sort((a, b) => {
                                const timeA = a.name.substring(meetingName.length, a.name.length - 4) // remove .txt
                                const timeB = b.name.substring(meetingName.length, b.name.length - 4)
                                const dateA = parsedDate(timeA)
                                const dateB = parsedDate(timeB)
                                return dateB - dateA;
                            })
                            .at(0);

                    console.log(txtFiles.name)
                    //read txt file
                    const content = await readFile(scriptPath + txtFiles.name, 'utf8');
                    console.log(content)
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

            }, 60000) //1min turn off call to quit driver

        }, duration + 60000); // 1min on top of call
    }
};

