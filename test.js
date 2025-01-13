import fs from 'fs';
import {readdir, readFile} from "fs/promises";
import parsedDate from "./parse-date.js";

//console.log(new Date("2024-09-27T07:00:00.000Z") > new Date())
//console.log(new Date())
/*const data = await readFile('C:\\Users\\leduc\\Downloads\\FRecord\\Transcript-vzb-uvfd-jji at 10-01-2024, 04-38 PM.txt');
const buffer = Buffer.from(data);
const string = buffer.toString('utf8'); // You can specify the encoding, 'utf8' is the default.
console.log(string);*/
let scriptPath = 'C:/Users/leduc/Downloads/Meowmo/';

let meetingName = 'Transcript-eep-ffji-qcn-'
const files = await readdir(scriptPath, {withFileTypes: true});
const txtFiles =
    files.filter(file => file.isFile() && file.name.includes(meetingName, 0))
        .sort((a, b) => {
            const timeA = a.name.substring(meetingName.length, a.name.length - 4) // remove .txt
            const timeB = b.name.substring(meetingName.length, b.name.length - 4)
            console.log("timeA " + timeA)
            console.log("timeB " + timeB)
            const dateA = parsedDate(timeA)
            const dateB = parsedDate(timeB)
            return dateB - dateA;
        })
        .at(0);

console.log(txtFiles)