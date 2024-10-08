import runMeeting from "./run-meeting.js"
import fs from 'fs';
import {readFile} from "fs/promises";

//console.log(new Date("2024-09-27T07:00:00.000Z") > new Date())
//console.log(new Date())
const data = await readFile('C:\\Users\\leduc\\Downloads\\FRecord\\Transcript-vzb-uvfd-jji at 10-01-2024, 04-38 PM.txt');
const buffer = Buffer.from(data);
const string = buffer.toString('utf8'); // You can specify the encoding, 'utf8' is the default.
console.log(string);

