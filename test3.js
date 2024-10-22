import {readdir} from "fs/promises";
import {scriptPath} from "./helpers.js";

let meetingName = 'MeetingNote-' + 'cya-dbkb-puh';
const re = /(\d\d)-(\d\d)-(\d\d\d\d),\s(\d\d)-(\d\d)\s(AM|PM)/gm;
const files = await readdir(scriptPath, {withFileTypes: true});
const txtFile =
    files.filter(file => file.isFile() && file.name.startsWith(meetingName) && file.name.endsWith('.txt'))
        .sort((a, b) => {
            let aVal = re.exec(a.name);
            let bVal = re.exec(b.name);
            if (aVal == null) return -1; // occur at the last iteration
            if (bVal == null) return -1; // occur at the almost last iteration
            let aDateCreation = new Date(+aVal[3], +aVal[1] - 1, +aVal[2], aVal[6] === 'PM' ? +aVal[4] + 12 : +aVal[4], +aVal[5]);
            let bDateCreation = new Date(+bVal[3], +bVal[1] - 1, +bVal[2], bVal[6] === 'PM' ? +bVal[4] + 12 : +bVal[4], +bVal[5]);
            return bDateCreation - aDateCreation;
        }) // sort -> newest to oldest
        .at(0); // get newest
console.log(txtFile);

// console.log(re.exec('MeetingNote-cya-dbkb-puh at 10-15-2024, 05-01 PM.txt'));
console.log('https://meet.google.com/fsz-skkn-kbx/asdasd'.substring(24, 36))