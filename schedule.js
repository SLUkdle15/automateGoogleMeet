import {ToadScheduler, SimpleIntervalJob, AsyncTask} from 'toad-scheduler';
import select from './query/select.js';
import runMeeting from './run-meeting.js';
import updateMeetingStarted from "./query/updateMeetingStarted.js";
import {cudp, udp} from "./constants.js";
import {cp} from "fs/promises";
import chrome from "selenium-webdriver/chrome.js";
import {Builder} from "selenium-webdriver";

const scheduler = new ToadScheduler()

const task = new AsyncTask(
    'simple task',
    async () => {
        const results = await select();

        // Specify the path to ChromeDriver and Chrome user data directory
        let userDataPath = udp;
        let cloneUserDataPath = cudp + new Date().getTime();
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
            if (new Date(meeting.start_time) < new Date()) {
                const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
                await runMeeting(driver, meeting.id_event, meeting.meet_url, duration)

                // set status to meeting started
                updateMeetingStarted(meeting.id);
            }
        }
    },
    (err) => {
        console.log("Error at time " + err)
    }
)
const job = new SimpleIntervalJob({seconds: 10}, task)

scheduler.addSimpleIntervalJob(job)