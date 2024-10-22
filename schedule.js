import {ToadScheduler, SimpleIntervalJob, AsyncTask} from 'toad-scheduler';
import select from "./query/select.js";
import {cloneUserDataDir, Choice, userDataPath} from "./helpers.js";
import {cp} from "fs/promises";
import chrome from "selenium-webdriver/chrome.js";
import {Builder} from "selenium-webdriver";
import updateMeetingStarted from "./query/updateMeetingStarted.js";
import { runSeparateBrowserInstancesUsingPuppeteer } from "./test2.js";

const scheduler = new ToadScheduler();

const task = new AsyncTask(
    'simple task',
    async () => {
        const results = await select();
        const meetChoice = 1; // 1 or 2
        switch (meetChoice) {
            case Choice.SeparateBrowserInstances:
                for (let i = 0; i < results.length; i++) {
                    const meeting = results[i];
                    console.log("meeting about to start id=" + meeting.id + " url=" + meeting.meet_url);
                    if (new Date(meeting.start_time) >= new Date()) {
                        continue;
                    }
                    const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
                    //await runSeparateBrowserInstances(meeting.id_event, meeting.meet_url, duration)
                    runSeparateBrowserInstancesUsingPuppeteer(meeting.id_event, meeting.meet_url, duration)
                    updateMeetingStarted(meeting.id);
                    // set status to meeting started
                }
                break;
            case Choice.MultipleTabs:
                let cloneUserDataPath = cloneUserDataDir + new Date().getTime();
                await cp(userDataPath, cloneUserDataPath, {recursive: true});

                let options = new chrome.Options();
                options.addArguments(`--user-data-dir=` + cloneUserDataPath);

                let driver = await new Builder()
                    .forBrowser('chrome')
                    .setChromeOptions(options)
                    .build();
                for (let i = 0; i < results.length; i++) {
                    const meeting = results[i];
                    console.log("meeting about to start id=" + meeting.id + " url=" + meeting.meet_url);
                    if (new Date(meeting.start_time) >= new Date()) {
                        continue;
                    }
                    const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
                    await runMultipleTabs(driver, meeting.meet_url, duration);
                }
                break;
        }

    },
    (err) => {
        console.log("Error at time " + err)
    }
)
const job = new SimpleIntervalJob({seconds: 30}, task);

scheduler.addSimpleIntervalJob(job);