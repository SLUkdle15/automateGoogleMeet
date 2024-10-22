import {ToadScheduler, SimpleIntervalJob, AsyncTask} from 'toad-scheduler';
import select from './query/select.js';
import runMeeting from './run-meeting.js';
import updateMeetingStarted from "./query/updateMeetingStarted.js";

const scheduler = new ToadScheduler()

const task = new AsyncTask(
    'simple task',
    async () => {
        const results = await select();

        for (let i = 0; i < results.length; i++) {
            const meeting = results[i];
            console.log("meeting about to start id" + meeting.id + " url " + meeting.meet_url);
            if (new Date(meeting.start_time) < new Date()) {
                const duration = new Date(meeting.end_time) - new Date(meeting.start_time);
                runMeeting(meeting.id_event, meeting.meet_url, duration)

                // set status to meeting started
                updateMeetingStarted(meeting.id);
            }
        }
    },
    (err) => {
        console.log("Error at time " + err)
    }
)
const job = new SimpleIntervalJob({seconds: 30}, task)

scheduler.addSimpleIntervalJob(job)