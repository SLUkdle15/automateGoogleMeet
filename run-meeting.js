import {Builder, By, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import {cp, rm, readFile, readdir} from 'fs/promises';
import axios from "axios";

export default async function (eventId, url, duration) {
    const endTimeSimulate = 10000
    // Specify the path to ChromeDriver and Chrome user data directory
    let userDataPath = 'C:/Users/leduc/AppData/Local/Google/Chrome/User Data';
    let cloneUserDataPath = 'C:/Users/leduc/Desktop/v/' + new Date().getTime() + '_' + eventId;
    let scriptPath = 'C:/Users/leduc/Downloads/FRecord/';
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

        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("//button[span='Join now']"))), 60000)

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
                        files.filter(file => file.isFile() && file.name.startsWith('MeetingNote-') && file.name.endsWith('.txt'))
                            .sort((a, b) => b.mtime - a.mtime)
                            .at(0);

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
                        console.error("failed" + error.response.data);
                    }

                }, 3000)

            }, 5000) //5 s turn off call to quit driver

        }, duration + 60000); // 1 mins
    }
};

