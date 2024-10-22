import db from './db.js';

export default async function() {
    const pool = db().pool;
    try {
        await pool.query("UPDATE meeting_schedule SET STATUS = 2 WHERE STATUS = 1 AND LOCATION = 'Online';");
        return "success";
    } catch (err) {
        console.log(err);
    } finally {
        await pool.end();
    }
};