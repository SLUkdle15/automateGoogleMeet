import runMeeting from "./run-meeting.js"
import fs from 'fs';
import {readFile} from "fs/promises";

const data = await readFile('C:\\Users\\leduc\\Downloads\\FRecord\\Transcript-vzb-uvfd-jji at 10-01-2024, 04-38 PM.txt');
const buffer = Buffer.from(data);
const string = buffer.toString('utf8'); // You can specify the encoding, 'utf8' is the default.
console.log(string);