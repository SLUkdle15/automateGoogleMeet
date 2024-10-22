import {AsyncTask, SimpleIntervalJob, ToadScheduler} from "toad-scheduler";
import select from "./query/select.js";
import {Choice} from "./helpers.js";
import {runSeparateInstancesUsingPuppeteer} from "./run_meeting/puppeteer-separate-instances.js";
import updateMeetingStarted from "./query/updateMeetingStarted.js";

const scheduler = new ToadScheduler();
const task = new AsyncTask(
    'simple task',
    async () => {
        const results = await select();
        const choice = 1; // 1 or 2
        switch (choice) {
            case Choice.SeparateInstances:
                for (let i = 0; i < results.length; i++) {
                    const meeting = results[i];
                    console.log("meeting about to start id=" + meeting.id + " url=" + meeting.meet_url);
                    if (new Date(meeting.start_time) >= new Date()) {
                        continue;
                    }
                    const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
                    await runSeparateInstancesUsingPuppeteer(meeting.id_event, meeting.meet_url, duration)
                    updateMeetingStarted(meeting.id);
                }
                break;
            // case Choice.MultipleTabs:
            //     let cloneUserDataPath = cloneUserDataDir + new Date().getTime();
            //     await cp(userDataPath, cloneUserDataPath, {recursive: true});
            //
            //     let options = new chrome.Options();
            //     options.addArguments(`--user-data-dir=` + cloneUserDataPath);
            //
            //     let driver = await new Builder()
            //         .forBrowser('chrome')
            //         .setChromeOptions(options)
            //         .build();
            //     for (let i = 0; i < results.length; i++) {
            //         const meeting = results[i];
            //         console.log("meeting about to start id=" + meeting.id + " url=" + meeting.meet_url);
            //         if (new Date(meeting.start_time) >= new Date()) {
            //             continue;
            //         }
            //         const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
            //         await runMultipleTabs(driver, meeting.meet_url, duration);
            //     }
            //     break;
        }
    },
    (err) => {
        console.log("Error at time " + err)
    }
)
const job = new SimpleIntervalJob({seconds: 30}, task);

scheduler.addSimpleIntervalJob(job);