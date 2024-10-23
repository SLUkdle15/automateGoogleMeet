import {readdir, readFile} from "fs/promises";
import axios from "axios";

const username = 'leduc'; // change this to ur actual Windows username
export const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
export const userDataPath = 'C:\\Users\\' + username + '\\AppData\\Local\\Google\\Chrome\\User Data\\';
export const cloneUserDataDir = 'D:\\v\\';
export const scriptPath = 'C:\\Users\\' + username + '\\Downloads\\FRecord\\';
export const Choice = {
    SeparateInstances: 1,
    MultipleTabs: 2
}
export const links = [
    'https://meet.google.com/fsz-skkn-kbx/',
    'https://meet.google.com/sid-mkfy-fti/',
    'https://meet.google.com/owr-fipt-ftv/',
]
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @example 'MeetingNote-cya-dbkb-puh at 10-14-2024, 05-03 PM.txt'
 * @description This will detect MM-DD-YYY, HH-MM and (AM or PM)
 * @type {RegExp}
 */
const regExp = /(\d\d)-(\d\d)-(\d\d\d\d),\s(\d\d)-(\d\d)\s(AM|PM)/gm;
const getSummary = async (meetingName) => {
    const files = await readdir(scriptPath, {withFileTypes: true});
    const summaryFile = files.filter(file => file.isFile() && file.name.startsWith(meetingName) && file.name.endsWith('.txt'))
        .sort((a, b) => {
            let aVal = regExp.exec(a.name);
            let bVal = regExp.exec(b.name);
            if (aVal == null) return -1; // occur at the last iteration
            if (bVal == null) return -1; // occur at the almost last iteration
            let aDateCreation = new Date(+aVal[3], +aVal[1] - 1, +aVal[2], aVal[6] === 'PM' ? +aVal[4] + 12 : +aVal[4], +aVal[5]);
            let bDateCreation = new Date(+bVal[3], +bVal[1] - 1, +bVal[2], bVal[6] === 'PM' ? +bVal[4] + 12 : +bVal[4], +bVal[5]);
            return bDateCreation - aDateCreation;
        }) // sort -> newest to oldest
        .at(0); // get newest
    return await readFile(scriptPath + summaryFile.name, 'utf8');
};
export const postSummary = async (eventId, meetingName) => {
    const summary = await getSummary(meetingName);
    const options = {
        method: 'POST',
        url: 'http://chat-api-dev.campdi.vn/api/meeting/summary',
        data: {
            "eventId": eventId,
            "summary": summary
        }
    };
    try {
        const {data} = await axios.request(options);
        console.log(data);
    } catch (error) {
        console.error("failed" + error);
    }
};